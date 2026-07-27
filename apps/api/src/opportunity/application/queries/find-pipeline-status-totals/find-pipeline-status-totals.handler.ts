import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FindPipelineStatusTotalsQuery } from './find-pipeline-status-totals.query';
import { PipelineStatusTotalsDto } from './pipeline-status-totals.dto';
import { OpportunityRepository } from '../../../domain/opportunity.repository';

@QueryHandler(FindPipelineStatusTotalsQuery)
export class FindPipelineStatusTotalsHandler implements IQueryHandler<
  FindPipelineStatusTotalsQuery,
  PipelineStatusTotalsDto[]
> {
  constructor(private readonly repo: OpportunityRepository) {}

  async execute(query: FindPipelineStatusTotalsQuery): Promise<PipelineStatusTotalsDto[]> {
    const totals = await this.repo.findStatusTotals(query.filters);
    return totals.map((t) => PipelineStatusTotalsDto.fromRaw(t));
  }
}
