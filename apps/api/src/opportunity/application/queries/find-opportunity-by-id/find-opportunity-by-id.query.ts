import { Query } from '@nestjs/cqrs';
import type { OpportunityDto } from '../find-all-opportunities/opportunity.dto';

export class FindOpportunityByIdQuery extends Query<OpportunityDto> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
