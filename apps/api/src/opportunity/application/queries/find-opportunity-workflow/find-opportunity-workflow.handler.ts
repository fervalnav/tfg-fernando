import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { OpportunityWorkflowDto } from '@tfg/types';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { FindOpportunityWorkflowQuery } from './find-opportunity-workflow.query';

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
