import { Command } from '@nestjs/cqrs';

export class RemoveMemberCommand extends Command<void> {
  constructor(
    public readonly accountId: string,
    public readonly targetUserId: string,
    public readonly requestingUserId: string,
  ) {
    super();
  }
}
