import { Query } from '@nestjs/cqrs';
import type { PipelineStatusTotalsDto } from './pipeline-status-totals.dto';

export class FindPipelineStatusTotalsQuery extends Query<PipelineStatusTotalsDto[]> {
  constructor(
    public readonly pipelineId: string,
    public readonly accountId: string,
  ) {
    super();
  }
}
