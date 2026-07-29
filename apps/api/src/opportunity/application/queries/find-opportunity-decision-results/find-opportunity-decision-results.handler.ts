import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { WorkflowDecisionResultDto } from '@tfg/types';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { FindOpportunityDecisionResultsQuery } from './find-opportunity-decision-results.query';

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
