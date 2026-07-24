import { Query } from '@nestjs/cqrs';
import type { WorkflowDetailDto } from '@tfg/types';

export class FindWorkflowByIdQuery extends Query<WorkflowDetailDto> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
