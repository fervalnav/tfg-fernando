import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindAllPipelinesQuery } from './find-all-pipelines.query';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineResponseDto } from './pipeline.dto';
import type { PaginatedResult, PipelineDto } from '@tfg/types';

const MAX_LIMIT = 20;

@QueryHandler(FindAllPipelinesQuery)
export class FindAllPipelinesHandler implements IQueryHandler<FindAllPipelinesQuery, PaginatedResult<PipelineDto>> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(query: FindAllPipelinesQuery): Promise<PaginatedResult<PipelineDto>> {
    const limit = Math.min(query.limit, MAX_LIMIT);
    const [pipelines, total] = await Promise.all([
      this.pipelineRepo.findAllByAccountId(query.accountId, query.page, limit),
      this.pipelineRepo.countByAccountId(query.accountId),
    ]);

    const items = await Promise.all(
      pipelines.map(async (pipeline) => {
        const statuses = await this.statusRepo.findByPipelineId(pipeline.id);
        return PipelineResponseDto.fromEntity(pipeline, statuses);
      }),
    );

    return { items, total, page: query.page, limit };
  }
}
