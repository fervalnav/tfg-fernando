import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { WorkflowStepActionDto } from '@tfg/types';
import { OpportunityWorkflowService } from '../../services/opportunity-workflow.service';
import { FindOpportunityStepActionsQuery } from './find-opportunity-step-actions.query';

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
