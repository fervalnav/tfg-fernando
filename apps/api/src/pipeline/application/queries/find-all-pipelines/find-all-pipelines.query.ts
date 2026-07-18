import { Query } from '@nestjs/cqrs';
import type { PaginatedResult, PipelineDto } from '@tfg/types';

export class FindAllPipelinesQuery extends Query<PaginatedResult<PipelineDto>> {
  constructor(
    public readonly accountId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {
    super();
  }
}
