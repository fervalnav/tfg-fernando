import { Command } from '@nestjs/cqrs';

export class CreateAttachmentCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public readonly opportunityId: string,
    public readonly workflowStepActionId: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly buffer: Buffer,
  ) {
    super();
  }
}
