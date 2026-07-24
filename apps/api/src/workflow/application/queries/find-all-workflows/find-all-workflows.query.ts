import { Query } from '@nestjs/cqrs';
import type { PaginatedResult, WorkflowDto } from '@tfg/types';

export class FindAllWorkflowsQuery extends Query<PaginatedResult<WorkflowDto>> {
  constructor(
    public readonly accountId: string,
    public readonly page: number,
    public readonly limit: number,
  ) {
    super();
  }
}
