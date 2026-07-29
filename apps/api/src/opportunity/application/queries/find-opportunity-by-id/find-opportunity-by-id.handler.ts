import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindOpportunityByIdQuery } from './find-opportunity-by-id.query';
import { OpportunityDto } from '../find-all-opportunities/opportunity.dto';
import { OpportunityFinder } from '../../services/opportunity.finder';

@QueryHandler(FindOpportunityByIdQuery)
export class FindOpportunityByIdHandler implements IQueryHandler<FindOpportunityByIdQuery, OpportunityDto> {
  constructor(private readonly finder: OpportunityFinder) {}

  async execute(query: FindOpportunityByIdQuery): Promise<OpportunityDto> {
    const opportunity = await this.finder.find(query.id, query.accountId);
    return OpportunityDto.fromEntity(opportunity);
  }
}
