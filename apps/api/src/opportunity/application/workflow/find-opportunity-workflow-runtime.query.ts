import { Query, QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { WorkflowDecisionResultDto, WorkflowStepActionDto } from '@tfg/types';
import { OpportunityWorkflowService } from './opportunity-workflow.service';

abstract class FindOpportunityWorkflowRuntimeQuery<T> extends Query<T> {
  protected constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}

export class FindOpportunityStepActionsQuery extends FindOpportunityWorkflowRuntimeQuery<WorkflowStepActionDto[]> {
  constructor(opportunityId: string, accountId: string) {
    super(opportunityId, accountId);
  }
}

export class FindOpportunityDecisionResultsQuery extends FindOpportunityWorkflowRuntimeQuery<
  WorkflowDecisionResultDto[]
> {
  constructor(opportunityId: string, accountId: string) {
    super(opportunityId, accountId);
  }
}

@QueryHandler(FindOpportunityStepActionsQuery)
export class FindOpportunityStepActionsHandler implements IQueryHandler<
  FindOpportunityStepActionsQuery,
  WorkflowStepActionDto[]
> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(query: FindOpportunityStepActionsQuery): Promise<WorkflowStepActionDto[]> {
    return (await this.service.find(query.opportunityId, query.accountId)).actions;
  }
}

@QueryHandler(FindOpportunityDecisionResultsQuery)
export class FindOpportunityDecisionResultsHandler implements IQueryHandler<
  FindOpportunityDecisionResultsQuery,
  WorkflowDecisionResultDto[]
> {
  constructor(private readonly service: OpportunityWorkflowService) {}

  async execute(query: FindOpportunityDecisionResultsQuery): Promise<WorkflowDecisionResultDto[]> {
    return (await this.service.find(query.opportunityId, query.accountId)).decisions;
  }
}
