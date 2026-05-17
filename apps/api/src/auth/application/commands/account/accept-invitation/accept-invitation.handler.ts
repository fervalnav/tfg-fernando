import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { AcceptInvitationCommand } from './accept-invitation.command';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { InvitationTokenRepository } from '../../../../domain/repositories/invitation-token.repository';
import { User } from '../../../../domain/entities/user.entity';
import { AccountMember } from '../../../../domain/entities/account-member.entity';
import { InvitationTokenInvalidException } from '../../../../domain/exceptions/invitation-token-invalid.exception';
import { UserAlreadyExistsException } from '../../../../domain/exceptions/user-already-exists.exception';
import { TokenService } from '../../../../infrastructure/token/token.service';
import { IdService } from '@/shared/domain/services/id.service';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';
import type { AuthResponseDto } from '@tfg/types';

@CommandHandler(AcceptInvitationCommand)
export class AcceptInvitationHandler implements ICommandHandler<AcceptInvitationCommand, AuthResponseDto> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly memberRepo: AccountMemberRepository,
    private readonly invitationRepo: InvitationTokenRepository,
    private readonly tokenService: TokenService,
    private readonly idService: IdService,
    private readonly sessionService: AuthSessionService,
  ) {}

  async execute(command: AcceptInvitationCommand): Promise<AuthResponseDto> {
    let payload: {
      jti: string;
      email: string;
      accountId: string;
      role: 'ADMIN' | 'MEMBER';
    };
    try {
      payload = this.tokenService.verifyInvitationToken(command.token);
    } catch {
      throw new InvitationTokenInvalidException();
    }

    const hash = this.tokenService.hashToken(payload.jti);
    const invitation = await this.invitationRepo.findByTokenHash(hash);
    if (!invitation || !invitation.isValid()) throw new InvitationTokenInvalidException();

    const existingUser = await this.userRepo.findByEmail(payload.email);
    if (existingUser) throw new UserAlreadyExistsException(payload.email);

    const passwordHash = await bcrypt.hash(command.password, 12);
    const user = User.create({
      id: command.userId,
      email: payload.email,
      passwordHash,
      firstName: command.firstName,
      lastName: command.lastName,
    });
    await this.userRepo.save(user);

    const members = await this.memberRepo.findAllByUser(user.id);
    const member = AccountMember.create({
      id: this.idService.generate(),
      accountId: payload.accountId,
      userId: user.id,
      role: payload.role,
      isDefault: members.length === 0,
    });
    await this.memberRepo.save(member);

    invitation.markAsUsed();
    await this.invitationRepo.update(invitation);

    const result: AuthResponseDto = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt.toISOString(),
      },
      accountId: payload.accountId,
    };

    await this.sessionService.createSessionByIds(user.id, payload.accountId, command.res);

    return result;
  }
}
