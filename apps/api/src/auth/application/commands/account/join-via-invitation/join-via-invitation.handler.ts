import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JoinViaInvitationCommand } from './join-via-invitation.command';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { InvitationTokenRepository } from '../../../../domain/repositories/invitation-token.repository';
import { AccountMember } from '../../../../domain/entities/account-member.entity';
import { InvitationTokenInvalidException } from '../../../../domain/exceptions/invitation-token-invalid.exception';
import { AccountMemberAlreadyExistsException } from '../../../../domain/exceptions/account-member-already-exists.exception';
import { TokenService } from '../../../../infrastructure/token/token.service';
import { IdService } from '@/shared/domain/services/id.service';
import { AuthSessionService } from '../../../../infrastructure/token/auth-session.service';
import type { AuthResponseDto } from '@tfg/types';

@CommandHandler(JoinViaInvitationCommand)
export class JoinViaInvitationHandler implements ICommandHandler<JoinViaInvitationCommand, AuthResponseDto> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly memberRepo: AccountMemberRepository,
    private readonly invitationRepo: InvitationTokenRepository,
    private readonly tokenService: TokenService,
    private readonly idService: IdService,
    private readonly sessionService: AuthSessionService,
  ) {}

  async execute(command: JoinViaInvitationCommand): Promise<AuthResponseDto> {
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

    const user = await this.userRepo.findById(command.userId);
    if (!user || user.email !== payload.email) throw new InvitationTokenInvalidException();

    const existingMember = await this.memberRepo.findByUserAndAccount(command.userId, payload.accountId);
    if (existingMember) throw new AccountMemberAlreadyExistsException(user.email, payload.accountId);

    const members = await this.memberRepo.findAllByUser(command.userId);
    const member = AccountMember.create({
      id: this.idService.generate(),
      accountId: payload.accountId,
      userId: command.userId,
      role: payload.role,
      isDefault: members.length === 0,
    });
    await this.memberRepo.save(member);

    invitation.markAsUsed();
    await this.invitationRepo.update(invitation);

    await this.sessionService.createSessionByIds(command.userId, payload.accountId, command.res);

    return {
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
  }
}
