import { Query } from '@nestjs/cqrs';
import type { PaginatedResult, SummaryTemplateDto } from '@tfg/types';

export class FindSummaryTemplatesQuery extends Query<PaginatedResult<SummaryTemplateDto>> {
  constructor(
    public readonly accountId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {
    super();
  }
}
