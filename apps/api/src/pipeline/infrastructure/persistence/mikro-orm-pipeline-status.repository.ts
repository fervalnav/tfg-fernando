import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { PipelineStatusRepository } from '../../domain/repositories/pipeline-status.repository';
import { PipelineStatus } from '../../domain/pipeline-status.entity';
import { PipelineStatusOrmEntity } from './pipeline-status.orm-entity';
import { PipelineOrmEntity } from './pipeline.orm-entity';

@Injectable()
export class MikroOrmPipelineStatusRepository implements PipelineStatusRepository {
  constructor(private readonly em: EntityManager) {}

  async findByPipelineId(pipelineId: string): Promise<PipelineStatus[]> {
    const orms = await this.em.find(
      PipelineStatusOrmEntity,
      { pipeline: { id: pipelineId } },
      { populate: ['pipeline'], orderBy: { sortPoints: 'ASC' } },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async findById(id: string): Promise<PipelineStatus | null> {
    const orm = await this.em.findOne(PipelineStatusOrmEntity, { id }, { populate: ['pipeline'] });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(status: PipelineStatus): Promise<void> {
    const p = status.toPrimitives();
    const existing = await this.em.findOne(PipelineStatusOrmEntity, { id: p.id }, { populate: ['pipeline'] });
    if (existing) {
      wrap(existing).assign({
        name: p.name,
        description: p.description,
        backgroundColor: p.backgroundColor,
        textColor: p.textColor,
        isInitial: p.isInitial,
        isTerminal: p.isTerminal,
        outcomeType: p.outcomeType,
        showInKanban: p.showInKanban,
        sortPoints: p.sortPoints,
        updatedAt: p.updatedAt,
      });
      await this.em.flush();
      return;
    }
    const pipelineRef = this.em.getReference(PipelineOrmEntity, p.pipelineId);
    const orm = new PipelineStatusOrmEntity({ ...p, pipeline: pipelineRef });
    await this.em.persistAndFlush(orm);
  }

  async saveMany(statuses: PipelineStatus[]): Promise<void> {
    for (const status of statuses) {
      const p = status.toPrimitives();
      const existing = await this.em.findOne(PipelineStatusOrmEntity, { id: p.id });
      if (existing) {
        wrap(existing).assign({
          name: p.name,
          description: p.description,
          backgroundColor: p.backgroundColor,
          textColor: p.textColor,
          isInitial: p.isInitial,
          isTerminal: p.isTerminal,
          outcomeType: p.outcomeType,
          showInKanban: p.showInKanban,
          sortPoints: p.sortPoints,
          updatedAt: p.updatedAt,
        });
      }
    }
    await this.em.flush();
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(PipelineStatusOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }

  async deleteByPipelineId(pipelineId: string): Promise<void> {
    await this.em.nativeDelete(PipelineStatusOrmEntity, { pipeline: { id: pipelineId } });
  }
}
