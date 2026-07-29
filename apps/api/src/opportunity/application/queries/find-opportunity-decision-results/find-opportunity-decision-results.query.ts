import { Query } from '@nestjs/cqrs';
import type { WorkflowDecisionResultDto } from '@tfg/types';

export class FindOpportunityDecisionResultsQuery extends Query<WorkflowDecisionResultDto[]> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
