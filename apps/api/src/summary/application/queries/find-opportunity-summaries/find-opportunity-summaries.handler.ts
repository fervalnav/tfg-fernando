import { QueryHandler, type IQueryHandler } from '@nestjs/cqrs';
import type { SummaryDto as ISummaryDto } from '@tfg/types';
import { SummaryRepository } from '../../../domain/summary.repository';
import { FindOpportunitySummariesQuery } from './find-opportunity-summaries.query';
import { SummaryDto } from './summary.dto';

@QueryHandler(FindOpportunitySummariesQuery)
export class FindOpportunitySummariesHandler implements IQueryHandler<FindOpportunitySummariesQuery, ISummaryDto[]> {
  constructor(private readonly repo: SummaryRepository) {}

  async execute(query: FindOpportunitySummariesQuery): Promise<ISummaryDto[]> {
    const items = await this.repo.findByOpportunityId(query.opportunityId, query.accountId);
    return items.map((item) => SummaryDto.fromEntity(item));
  }
}
