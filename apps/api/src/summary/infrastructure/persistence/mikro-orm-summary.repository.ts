import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { SummaryRepository } from '../../domain/summary.repository';
import type { Summary } from '../../domain/summary.entity';
import { SummaryOrmEntity } from './summary.orm-entity';

@Injectable()
export class MikroOrmSummaryRepository implements SummaryRepository {
  constructor(private readonly em: EntityManager) {}

  async findByOpportunityId(opportunityId: string, accountId: string): Promise<Summary[]> {
    const entities = await this.em.find(
      SummaryOrmEntity,
      { opportunityId, accountId },
      { orderBy: { createdAt: 'ASC' } },
    );
    return entities.map((entity) => entity.toDomainEntity());
  }

  async findByOpportunityAndTemplateId(opportunityId: string, summaryTemplateId: string): Promise<Summary | null> {
    const entity = await this.em.findOne(SummaryOrmEntity, { opportunityId, summaryTemplateId });
    return entity?.toDomainEntity() ?? null;
  }

  async findById(id: string): Promise<Summary | null> {
    const entity = await this.em.findOne(SummaryOrmEntity, { id });
    return entity?.toDomainEntity() ?? null;
  }

  async save(entity: Summary): Promise<void> {
    const primitives = entity.toPrimitives();
    const existing = await this.em.findOne(SummaryOrmEntity, { id: primitives.id });
    if (!existing) {
      await this.em.persistAndFlush(new SummaryOrmEntity(primitives));
      return;
    }
    wrap(existing).assign({ result: primitives.result, updatedAt: primitives.updatedAt });
    await this.em.flush();
  }

  async saveMany(entities: Summary[]): Promise<void> {
    if (!entities.length) return;
    this.em.persist(entities.map((entity) => new SummaryOrmEntity(entity.toPrimitives())));
    await this.em.flush();
  }
}
