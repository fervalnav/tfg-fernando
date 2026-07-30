import { CommandHandler, EventBus, type ICommandHandler } from '@nestjs/cqrs';
import {
  OpportunityFinder,
  OpportunityWorkflowConflictException,
  WorkflowStepActionRepository,
  WorkflowStepActionStatusChangedEvent,
} from '@/opportunity';
import { Attachment } from '../../../domain/attachment.entity';
import { AttachmentRepository } from '../../../domain/attachment.repository';
import { AttachmentStorageService } from '../../../domain/attachment-storage.service';
import { AttachmentAlreadyExistsException } from '../../../domain/exceptions/attachment-already-exists.exception';
import { CreateAttachmentCommand } from './create-attachment.command';

@CommandHandler(CreateAttachmentCommand)
export class CreateAttachmentHandler implements ICommandHandler<CreateAttachmentCommand, void> {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly storage: AttachmentStorageService,
    private readonly opportunityFinder: OpportunityFinder,
    private readonly actions: WorkflowStepActionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateAttachmentCommand): Promise<void> {
    const opportunity = await this.opportunityFinder.find(command.opportunityId, command.accountId);
    const existing = await this.attachments.findById(command.id);
    if (existing) throw new AttachmentAlreadyExistsException(command.id);

    const action = command.workflowStepActionId
      ? await this.actions.findById(command.workflowStepActionId, command.opportunityId)
      : null;
    if (
      command.workflowStepActionId &&
      (!action ||
        action.toPrimitives().accountId !== command.accountId ||
        action.targetType !== 'attachment' ||
        action.workflowStepId !== opportunity.workflowStepId ||
        action.isSettled)
    ) {
      throw new OpportunityWorkflowConflictException('La acción de adjunto no está disponible');
    }

    const safeName = command.name.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
    const fileKey = `${command.accountId}/opportunities/${command.opportunityId}/attachments/${command.id}/${safeName}`;
    const attachment = Attachment.create({
      id: command.id,
      accountId: command.accountId,
      opportunityId: command.opportunityId,
      workflowStepActionId: command.workflowStepActionId,
      name: command.name,
      description: command.description,
      mimeType: command.mimeType,
      size: command.size,
      fileKey,
    });

    await this.storage.upload(fileKey, command.buffer, command.mimeType);
    try {
      await this.attachments.save(attachment);
      if (!action) return;
      action.completeWithTarget(command.id);
      await this.actions.save(action);
      this.eventBus.publish(new WorkflowStepActionStatusChangedEvent(command.opportunityId, command.accountId));
    } catch (error) {
      await this.storage.delete(fileKey);
      await this.attachments.delete(command.id);
      throw error;
    }
  }
}
