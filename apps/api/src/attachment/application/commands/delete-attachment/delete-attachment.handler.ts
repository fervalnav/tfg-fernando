import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AttachmentRepository } from '../../../domain/attachment.repository';
import { AttachmentStorageService } from '../../../domain/attachment-storage.service';
import { AttachmentNotFoundException } from '../../../domain/exceptions/attachment-not-found.exception';
import { AttachmentLinkedToWorkflowException } from '../../../domain/exceptions/attachment-linked-to-workflow.exception';
import { DeleteAttachmentCommand } from './delete-attachment.command';

@CommandHandler(DeleteAttachmentCommand)
export class DeleteAttachmentHandler implements ICommandHandler<DeleteAttachmentCommand, void> {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly storage: AttachmentStorageService,
  ) {}

  async execute(command: DeleteAttachmentCommand): Promise<void> {
    const attachment = await this.attachments.findById(command.id);
    if (
      !attachment ||
      attachment.accountId !== command.accountId ||
      attachment.opportunityId !== command.opportunityId
    ) {
      throw new AttachmentNotFoundException(command.id);
    }
    if (attachment.toPrimitives().workflowStepActionId) {
      throw new AttachmentLinkedToWorkflowException(command.id);
    }
    await this.storage.delete(attachment.fileKey);
    await this.attachments.delete(attachment.id);
  }
}
