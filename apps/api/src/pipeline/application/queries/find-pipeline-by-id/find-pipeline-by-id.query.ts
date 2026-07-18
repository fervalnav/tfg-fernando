import { Query } from '@nestjs/cqrs';
import type { PipelineDto } from '@tfg/types';

export class FindPipelineByIdQuery extends Query<PipelineDto> {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
