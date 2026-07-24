import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDefaultStepActionCommand } from './create-default-step-action.command';
import { DefaultWorkflowStepActionRepository } from '../../../domain/default-workflow-step-action.repository';
import { WorkflowStepRepository } from '../../../domain/workflow-step.repository';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { DefaultWorkflowStepAction } from '../../../domain/default-workflow-step-action.entity';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';

@CommandHandler(CreateDefaultStepActionCommand)
export class CreateDefaultStepActionHandler implements ICommandHandler<CreateDefaultStepActionCommand, void> {
  constructor(
    private readonly actionRepo: DefaultWorkflowStepActionRepository,
    private readonly stepRepo: WorkflowStepRepository,
    private readonly workflowRepo: WorkflowRepository,
  ) {}

  async execute(command: CreateDefaultStepActionCommand): Promise<void> {
    const workflow = await this.workflowRepo.findById(command.workflowId);
    if (!workflow || workflow.accountId !== command.accountId) throw new WorkflowNotFoundException(command.workflowId);

    const action = DefaultWorkflowStepAction.create({
      id: command.id,
      workflowStepId: command.workflowStepId,
      name: command.name,
      targetType: command.targetType,
      targetId: command.targetId ?? undefined,
      metadata: command.metadata ?? undefined,
      position: command.position,
    });
    await this.actionRepo.save(action);
  }
}
