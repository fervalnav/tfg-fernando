import { Query } from '@nestjs/cqrs';
import type { PipelineStatusTotalsDto } from './pipeline-status-totals.dto';
import type { OpportunityFilters } from '../../../domain/opportunity.repository';

export class FindPipelineStatusTotalsQuery extends Query<PipelineStatusTotalsDto[]> {
  constructor(public readonly filters: OpportunityFilters) {
    super();
  }
}
