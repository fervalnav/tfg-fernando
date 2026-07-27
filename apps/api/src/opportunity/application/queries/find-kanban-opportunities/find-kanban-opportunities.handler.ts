import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindKanbanOpportunitiesQuery } from './find-kanban-opportunities.query';
import { OpportunityDto } from '../find-all-opportunities/opportunity.dto';
import { OpportunityRepository } from '../../../domain/opportunity.repository';

@QueryHandler(FindKanbanOpportunitiesQuery)
export class FindKanbanOpportunitiesHandler implements IQueryHandler<FindKanbanOpportunitiesQuery, OpportunityDto[]> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(query: FindKanbanOpportunitiesQuery): Promise<OpportunityDto[]> {
    const opportunities = await this.repo.findKanban(query.filters);
    return opportunities.map((e) => OpportunityDto.fromEntity(e));
  }
}
