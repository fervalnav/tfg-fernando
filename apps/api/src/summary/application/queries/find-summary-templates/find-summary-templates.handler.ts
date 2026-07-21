import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { PaginatedResult, SummaryTemplateDto as ISummaryTemplateDto } from '@tfg/types';
import { FindSummaryTemplatesQuery } from './find-summary-templates.query';
import { SummaryTemplateRepository } from '../../../domain/summary-template.repository';
import { SummaryTemplateDto } from './summary-template.dto';

const MAX_LIMIT = 20;

@QueryHandler(FindSummaryTemplatesQuery)
export class FindSummaryTemplatesHandler implements IQueryHandler<
  FindSummaryTemplatesQuery,
  PaginatedResult<ISummaryTemplateDto>
> {
  constructor(private readonly repo: SummaryTemplateRepository) {}

  async execute(query: FindSummaryTemplatesQuery): Promise<PaginatedResult<ISummaryTemplateDto>> {
    const limit = Math.min(query.limit, MAX_LIMIT);
    const [items, total] = await Promise.all([
      this.repo.findAllByAccountId(query.accountId, query.page, limit),
      this.repo.countByAccountId(query.accountId),
    ]);
    return {
      items: items.map((e) => SummaryTemplateDto.fromEntity(e)),
      total,
      page: query.page,
      limit,
    };
  }
}
