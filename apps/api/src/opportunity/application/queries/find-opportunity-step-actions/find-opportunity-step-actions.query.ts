import { Query } from '@nestjs/cqrs';
import type { WorkflowStepActionDto } from '@tfg/types';

export class FindOpportunityStepActionsQuery extends Query<WorkflowStepActionDto[]> {
  constructor(
    public readonly opportunityId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
