import { Query, QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { OpportunityWorkflowDto } from '@tfg/types';
import { OpportunityWorkflowService } from './opportunity-workflow.service';

export class FindOpportunityWorkflowQuery extends Query<OpportunityWorkflowDto> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}

@QueryHandler(FindOpportunityWorkflowQuery)
export class FindOpportunityWorkflowHandler implements IQueryHandler<
  FindOpportunityWorkflowQuery,
  OpportunityWorkflowDto
> {
  constructor(private readonly service: OpportunityWorkflowService) {}
  async execute(query: FindOpportunityWorkflowQuery): Promise<OpportunityWorkflowDto> {
    return this.service.find(query.opportunityId, query.accountId);
  }
}
