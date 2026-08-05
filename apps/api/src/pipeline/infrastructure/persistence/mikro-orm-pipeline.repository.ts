import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { PipelineRepository } from '../../domain/repositories/pipeline.repository';
import { Pipeline } from '../../domain/pipeline.entity';
import { PipelineOrmEntity } from './pipeline.orm-entity';

@Injectable()
export class MikroOrmPipelineRepository implements PipelineRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllByAccountId(accountId: string, page: number, limit: number): Promise<Pipeline[]> {
    const offset = (page - 1) * limit;
    const orms = await this.em.find(
      PipelineOrmEntity,
      { accountId },
      {
        orderBy: { createdAt: 'ASC' },
        limit,
        offset,
      },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async countByAccountId(accountId: string): Promise<number> {
    return this.em.count(PipelineOrmEntity, { accountId });
  }

  async findById(id: string): Promise<Pipeline | null> {
    const orm = await this.em.findOne(PipelineOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(pipeline: Pipeline): Promise<void> {
    const primitives = pipeline.toPrimitives();
    const existing = await this.em.findOne(PipelineOrmEntity, { id: primitives.id });
    if (existing) {
      wrap(existing).assign({ name: primitives.name, updatedAt: primitives.updatedAt });
      await this.em.flush();
      return;
    }
    const orm = new PipelineOrmEntity(primitives);
    await this.em.persistAndFlush(orm);
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(PipelineOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
