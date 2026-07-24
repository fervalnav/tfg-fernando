import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DuplicateWorkflowCommand } from './duplicate-workflow.command';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowStepRepository } from '../../../domain/workflow-step.repository';
import { DefaultWorkflowStepActionRepository } from '../../../domain/default-workflow-step-action.repository';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';
import { Workflow } from '../../../domain/workflow.entity';
import { WorkflowStep } from '../../../domain/workflow-step.entity';
import { DefaultWorkflowStepAction } from '../../../domain/default-workflow-step-action.entity';
import { IdService } from '@/shared/domain/services/id.service';

@CommandHandler(DuplicateWorkflowCommand)
export class DuplicateWorkflowHandler implements ICommandHandler<DuplicateWorkflowCommand, void> {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly stepRepo: WorkflowStepRepository,
    private readonly actionRepo: DefaultWorkflowStepActionRepository,
    private readonly idService: IdService,
  ) {}

  async execute(command: DuplicateWorkflowCommand): Promise<void> {
    const source = await this.workflowRepo.findById(command.sourceId);
    if (!source || source.accountId !== command.accountId) throw new WorkflowNotFoundException(command.sourceId);

    const copy = Workflow.create({
      id: command.newId,
      accountId: command.accountId,
      name: `${source.name} (copia)`,
      description: source.description ?? undefined,
    });
    await this.workflowRepo.save(copy);

    const sourceSteps = await this.stepRepo.findByWorkflowId(command.sourceId);
    if (!sourceSteps.length) return;

    const sourceActions = await this.actionRepo.findByWorkflowStepIds(sourceSteps.map((s) => s.id));
    const actionsByStep = new Map<string, typeof sourceActions>();
    sourceActions.forEach((a) => {
      const list = actionsByStep.get(a.workflowStepId) ?? [];
      list.push(a);
      actionsByStep.set(a.workflowStepId, list);
    });

    const newSteps: WorkflowStep[] = [];
    const newActions: DefaultWorkflowStepAction[] = [];

    for (const step of sourceSteps) {
      const newStepId = this.idService.generate();
      newSteps.push(
        WorkflowStep.create({
          id: newStepId,
          workflowId: command.newId,
          name: step.name,
          type: step.type,
          condition: step.condition ?? undefined,
          position: step.position,
        }),
      );

      const stepActions = actionsByStep.get(step.id) ?? [];
      for (const action of stepActions) {
        newActions.push(
          DefaultWorkflowStepAction.create({
            id: this.idService.generate(),
            workflowStepId: newStepId,
            name: action.name,
            targetType: action.targetType,
            targetId: action.targetId ?? undefined,
            metadata: action.metadata ?? undefined,
            position: action.position,
          }),
        );
      }
    }

    await this.stepRepo.saveMany(newSteps);
    if (newActions.length) {
      await Promise.all(newActions.map((a) => this.actionRepo.save(a)));
    }
  }
}
