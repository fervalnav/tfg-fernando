import { Query } from '@nestjs/cqrs';
import type { OpportunityWorkflowDto } from '@tfg/types';

export class FindOpportunityWorkflowQuery extends Query<OpportunityWorkflowDto> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
