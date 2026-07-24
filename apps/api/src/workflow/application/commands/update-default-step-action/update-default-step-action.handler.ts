import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDefaultStepActionCommand } from './update-default-step-action.command';
import { DefaultWorkflowStepActionRepository } from '../../../domain/default-workflow-step-action.repository';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';
import { WorkflowStepActionNotFoundException } from '../../../domain/exceptions/workflow-step-action-not-found.exception';

@CommandHandler(UpdateDefaultStepActionCommand)
export class UpdateDefaultStepActionHandler implements ICommandHandler<UpdateDefaultStepActionCommand, void> {
  constructor(
    private readonly actionRepo: DefaultWorkflowStepActionRepository,
    private readonly workflowRepo: WorkflowRepository,
  ) {}

  async execute(command: UpdateDefaultStepActionCommand): Promise<void> {
    const workflow = await this.workflowRepo.findById(command.workflowId);
    if (!workflow || workflow.accountId !== command.accountId) throw new WorkflowNotFoundException(command.workflowId);

    const action = await this.actionRepo.findById(command.id);
    if (!action) throw new WorkflowStepActionNotFoundException(command.id);

    action.update(command.name, command.targetType, command.targetId, command.metadata, command.position);
    await this.actionRepo.save(action);
  }
}
