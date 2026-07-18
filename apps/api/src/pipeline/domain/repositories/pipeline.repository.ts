import type { Pipeline } from '../pipeline.entity';

export abstract class PipelineRepository {
  abstract findAllByAccountId(accountId: string, page: number, limit: number): Promise<Pipeline[]>;
  abstract countByAccountId(accountId: string): Promise<number>;
  abstract findById(id: string): Promise<Pipeline | null>;
  abstract save(pipeline: Pipeline): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
