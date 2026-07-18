import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindPipelineByIdQuery } from './find-pipeline-by-id.query';
import { PipelineRepository } from '../../../domain/repositories/pipeline.repository';
import { PipelineStatusRepository } from '../../../domain/repositories/pipeline-status.repository';
import { PipelineResponseDto } from '../find-all-pipelines/pipeline.dto';
import { PipelineNotFoundException } from '../../../domain/exceptions/pipeline-not-found.exception';
import type { PipelineDto } from '@tfg/types';

@QueryHandler(FindPipelineByIdQuery)
export class FindPipelineByIdHandler implements IQueryHandler<FindPipelineByIdQuery, PipelineDto> {
  constructor(
    private readonly pipelineRepo: PipelineRepository,
    private readonly statusRepo: PipelineStatusRepository,
  ) {}

  async execute(query: FindPipelineByIdQuery): Promise<PipelineDto> {
    const pipeline = await this.pipelineRepo.findById(query.id);
    if (!pipeline || pipeline.accountId !== query.accountId) throw new PipelineNotFoundException(query.id);

    const statuses = await this.statusRepo.findByPipelineId(pipeline.id);
    return PipelineResponseDto.fromEntity(pipeline, statuses);
  }
}
