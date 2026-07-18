import type { PipelineStatus } from '../pipeline-status.entity';

export abstract class PipelineStatusRepository {
  abstract findByPipelineId(pipelineId: string): Promise<PipelineStatus[]>;
  abstract findById(id: string): Promise<PipelineStatus | null>;
  abstract save(status: PipelineStatus): Promise<void>;
  abstract saveMany(statuses: PipelineStatus[]): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByPipelineId(pipelineId: string): Promise<void>;
}
