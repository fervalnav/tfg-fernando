import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateWorkflowStepsCommand } from './update-workflow-steps.command';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowStepRepository } from '../../../domain/workflow-step.repository';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';
import { WorkflowStep } from '../../../domain/workflow-step.entity';

@CommandHandler(UpdateWorkflowStepsCommand)
export class UpdateWorkflowStepsHandler implements ICommandHandler<UpdateWorkflowStepsCommand, void> {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly stepRepo: WorkflowStepRepository,
  ) {}

  async execute(command: UpdateWorkflowStepsCommand): Promise<void> {
    const workflow = await this.workflowRepo.findById(command.workflowId);
    if (!workflow || workflow.accountId !== command.accountId) throw new WorkflowNotFoundException(command.workflowId);

    const existing = await this.stepRepo.findByWorkflowId(command.workflowId);
    const existingMap = new Map(existing.map((s) => [s.id, s]));
    const incomingIds = new Set(command.steps.map((s) => s.id));

    const toDelete = existing.filter((s) => !incomingIds.has(s.id)).map((s) => s.id);
    if (toDelete.length) await this.stepRepo.deleteMany(toDelete);

    const toSave: WorkflowStep[] = command.steps.map((input) => {
      const found = existingMap.get(input.id);
      if (found) {
        found.update(input.name, input.type, input.condition, input.position);
        return found;
      }
      return WorkflowStep.create({
        id: input.id,
        workflowId: command.workflowId,
        name: input.name,
        type: input.type,
        condition: input.condition ?? undefined,
        position: input.position,
      });
    });

    if (toSave.length) await this.stepRepo.saveMany(toSave);
  }
}
