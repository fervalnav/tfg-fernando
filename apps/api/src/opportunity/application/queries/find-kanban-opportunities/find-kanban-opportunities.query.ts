import { Query } from '@nestjs/cqrs';
import type { OpportunityDto } from '../find-all-opportunities/opportunity.dto';

export class FindKanbanOpportunitiesQuery extends Query<OpportunityDto[]> {
  constructor(
    public readonly pipelineId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
