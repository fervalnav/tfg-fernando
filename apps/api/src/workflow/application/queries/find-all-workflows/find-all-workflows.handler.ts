import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { PaginatedResult, WorkflowDto as IWorkflowDto } from '@tfg/types';
import { FindAllWorkflowsQuery } from './find-all-workflows.query';
import { WorkflowRepository } from '../../../domain/workflow.repository';
import { WorkflowStepRepository } from '../../../domain/workflow-step.repository';
import { WorkflowDto } from './workflow.dto';

const MAX_LIMIT = 20;

@QueryHandler(FindAllWorkflowsQuery)
export class FindAllWorkflowsHandler implements IQueryHandler<FindAllWorkflowsQuery, PaginatedResult<IWorkflowDto>> {
  constructor(
    private readonly workflowRepo: WorkflowRepository,
    private readonly stepRepo: WorkflowStepRepository,
  ) {}

  async execute(query: FindAllWorkflowsQuery): Promise<PaginatedResult<IWorkflowDto>> {
    const limit = Math.min(query.limit, MAX_LIMIT);
    const [workflows, total] = await Promise.all([
      this.workflowRepo.findAllByAccountId(query.accountId, query.page, limit),
      this.workflowRepo.countByAccountId(query.accountId),
    ]);

    const items = await Promise.all(
      workflows.map(async (w) => {
        const steps = await this.stepRepo.findByWorkflowId(w.id);
        return WorkflowDto.fromEntity(w, steps.length);
      }),
    );

    return { items, total, page: query.page, limit };
  }
}
