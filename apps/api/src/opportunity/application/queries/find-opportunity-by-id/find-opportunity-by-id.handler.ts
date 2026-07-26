import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindOpportunityByIdQuery } from './find-opportunity-by-id.query';
import { OpportunityDto } from '../find-all-opportunities/opportunity.dto';
import { OpportunityRepository } from '../../../domain/opportunity.repository';
import { OpportunityNotFoundException } from '../../../domain/exceptions/opportunity-not-found.exception';

@QueryHandler(FindOpportunityByIdQuery)
export class FindOpportunityByIdHandler implements IQueryHandler<FindOpportunityByIdQuery, OpportunityDto> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(query: FindOpportunityByIdQuery): Promise<OpportunityDto> {
    const opportunity = await this.repo.findById(query.id, query.accountId);
    if (!opportunity) throw new OpportunityNotFoundException(query.id);
    return OpportunityDto.fromEntity(opportunity);
  }
}
