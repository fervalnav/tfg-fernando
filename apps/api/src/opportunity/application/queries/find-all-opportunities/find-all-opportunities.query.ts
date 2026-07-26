import { Query } from '@nestjs/cqrs';
import type { PaginatedResult } from '@/shared/domain/dto/paginated.dto';
import type { OpportunityDto } from './opportunity.dto';

export class FindAllOpportunitiesQuery extends Query<PaginatedResult<OpportunityDto>> {
  constructor(
    public readonly accountId: string,
    public readonly pipelineId: string,
    public readonly page: number,
    public readonly limit: number,
    public readonly q?: string,
    public readonly statusIds?: string[],
    public readonly userId?: string,
    public readonly dueDateFrom?: Date,
    public readonly dueDateTo?: Date,
    public readonly amountMin?: number,
    public readonly amountMax?: number,
  ) {
    super();
  }
}
