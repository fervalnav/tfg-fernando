import { Command } from '@nestjs/cqrs';
import type { AccountMemberRole } from '../../../../domain/value-objects/account-member-role.value-object';

export class InviteMemberCommand extends Command<void> {
  constructor(
    public readonly invitationId: string,
    public readonly accountId: string,
    public readonly inviterUserId: string,
    public readonly email: string,
    public readonly role: AccountMemberRole,
  ) {
    super();
  }
}
