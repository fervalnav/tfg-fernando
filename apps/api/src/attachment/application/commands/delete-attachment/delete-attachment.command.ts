import { Command } from '@nestjs/cqrs';

export class DeleteAttachmentCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
