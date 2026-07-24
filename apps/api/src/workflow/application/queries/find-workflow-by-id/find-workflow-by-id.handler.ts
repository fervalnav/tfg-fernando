import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { WorkflowDetailDto } from '@tfg/types';
import { FindWorkflowByIdQuery } from './find-workflow-by-id.query';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowStepRepository } from '../../../domain/workflow-step.repository';
import { DefaultWorkflowStepActionRepository } from '../../../domain/default-workflow-step-action.repository';
import { WorkflowDetailResponseDto } from './workflow-detail.dto';
import { WorkflowNotFoundException } from '../../../domain/exceptions/workflow-not-found.exception';
import type { DefaultWorkflowStepAction } from '../../../domain/default-workflow-step-action.entity';

@QueryHandler(FindWorkflowByIdQuery)
export class FindWorkflowByIdHandler implements IQueryHandler<FindWorkflowByIdQuery, WorkflowDetailDto> {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly stepRepo: WorkflowStepRepository,
    private readonly actionRepo: DefaultWorkflowStepActionRepository,
  ) {}

  async execute(query: FindWorkflowByIdQuery): Promise<WorkflowDetailDto> {
    const workflow = await this.workflowRepo.findById(query.id);
    if (!workflow || workflow.accountId !== query.accountId) throw new WorkflowNotFoundException(query.id);

    const steps = await this.stepRepo.findByWorkflowId(query.id);
    const actions = steps.length ? await this.actionRepo.findByWorkflowStepIds(steps.map((s) => s.id)) : [];

    const actionsByStep = new Map<string, DefaultWorkflowStepAction[]>();
    actions.forEach((a) => {
      const list = actionsByStep.get(a.workflowStepId) ?? [];
      list.push(a);
      actionsByStep.set(a.workflowStepId, list);
    });

    return WorkflowDetailResponseDto.fromEntity(workflow, steps, actionsByStep);
  }
}
