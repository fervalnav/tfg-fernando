import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import type { PaginatedResult } from '@/shared/domain/dto/paginated.dto';
import { FindAllOpportunitiesQuery } from './find-all-opportunities.query';
import { OpportunityDto } from './opportunity.dto';
import { OpportunityRepository } from '../../../domain/opportunity.repository';

@QueryHandler(FindAllOpportunitiesQuery)
export class FindAllOpportunitiesHandler implements IQueryHandler<
  FindAllOpportunitiesQuery,
  PaginatedResult<OpportunityDto>
> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(query: FindAllOpportunitiesQuery): Promise<PaginatedResult<OpportunityDto>> {
    const result = await this.repo.findAll(
      {
        accountId: query.accountId,
        pipelineId: query.pipelineId,
        q: query.q,
        statusIds: query.statusIds,
        userId: query.userId,
        dueDateFrom: query.dueDateFrom,
        dueDateTo: query.dueDateTo,
        amountMin: query.amountMin,
        amountMax: query.amountMax,
      },
      query.page,
      query.limit,
    );

    return {
      items: result.items.map((e) => OpportunityDto.fromEntity(e)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
