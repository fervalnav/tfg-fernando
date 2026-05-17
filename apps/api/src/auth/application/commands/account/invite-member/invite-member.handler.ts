import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { InviteMemberCommand } from './invite-member.command';
import { UserRepository } from '../../../../domain/repositories/user.repository';
import { AccountRepository } from '../../../../domain/repositories/account.repository';
import { AccountMemberRepository } from '../../../../domain/repositories/account-member.repository';
import { InvitationTokenRepository } from '../../../../domain/repositories/invitation-token.repository';
import { InvitationToken } from '../../../../domain/entities/invitation-token.entity';
import { AccountMemberAlreadyExistsException } from '../../../../domain/exceptions/account-member-already-exists.exception';
import { TokenService } from '../../../../infrastructure/token/token.service';
import { EmailService } from '../../../../../shared/infrastructure/email/email.service';
import { buildInvitationEmailHtml } from '../../../../../shared/infrastructure/email/templates/invitation.template';

@CommandHandler(InviteMemberCommand)
export class InviteMemberHandler implements ICommandHandler<InviteMemberCommand, void> {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly accountRepo: AccountRepository,
    private readonly memberRepo: AccountMemberRepository,
    private readonly invitationRepo: InvitationTokenRepository,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: InviteMemberCommand): Promise<void> {
    const existingUser = await this.userRepo.findByEmail(command.email);
    if (existingUser) {
      const existingMember = await this.memberRepo.findByUserAndAccount(existingUser.id, command.accountId);
      if (existingMember) {
        throw new AccountMemberAlreadyExistsException(command.email, command.accountId);
      }
    }

    const [account, inviter] = await Promise.all([
      this.accountRepo.findById(command.accountId),
      this.userRepo.findById(command.inviterUserId),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitationTokenJwt = this.tokenService.signInvitationToken({
      jti: command.invitationId,
      email: command.email,
      accountId: command.accountId,
      role: command.role,
    });
    const tokenHash = this.tokenService.hashToken(command.invitationId);

    const invitation = InvitationToken.create({
      id: command.invitationId,
      accountId: command.accountId,
      email: command.email,
      role: command.role,
      tokenHash,
      expiresAt,
    });
    await this.invitationRepo.save(invitation);

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const invitationUrl = `${frontendUrl}/auth/accept-invitation?token=${invitationTokenJwt}`;

    await this.emailService.sendMail({
      to: command.email,
      subject: `Invitación a ${account?.name ?? 'la cuenta'}`,
      html: buildInvitationEmailHtml({
        inviterName: inviter?.fullName ?? 'Un administrador',
        accountName: account?.name ?? '',
        invitationUrl,
      }),
    });
  }
}
