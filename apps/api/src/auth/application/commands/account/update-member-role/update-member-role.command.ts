import { Command } from '@nestjs/cqrs';
import type { AccountMemberRole } from '../../../../domain/value-objects/account-member-role.value-object';

export class UpdateMemberRoleCommand extends Command<void> {
  constructor(
    public readonly accountId: string,
    public readonly targetUserId: string,
    public readonly role: AccountMemberRole,
  ) {
    super();
  }
}
