import { Query } from '@nestjs/cqrs';
import type { OpportunityDto } from '../find-all-opportunities/opportunity.dto';
import type { OpportunityFilters } from '../../../domain/opportunity.repository';

export class FindKanbanOpportunitiesQuery extends Query<OpportunityDto[]> {
  constructor(public readonly filters: OpportunityFilters) {
    super();
  }
}
