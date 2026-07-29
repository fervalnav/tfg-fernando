import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { ControlQuestionRepository } from '../../domain/control-question.repository';
import type { ControlQuestion } from '../../domain/control-question.entity';
import { ControlQuestionOrmEntity } from './control-question.orm-entity';

@Injectable()
export class MikroOrmControlQuestionRepository implements ControlQuestionRepository {
  constructor(private readonly em: EntityManager) {}

  async findByOpportunityId(opportunityId: string, accountId: string): Promise<ControlQuestion[]> {
    const entities = await this.em.find(
      ControlQuestionOrmEntity,
      { opportunityId, accountId },
      { orderBy: { createdAt: 'ASC' } },
    );
    return entities.map((entity) => entity.toDomainEntity());
  }

  async findByOpportunityAndDefaultId(
    opportunityId: string,
    defaultControlQuestionId: string,
  ): Promise<ControlQuestion | null> {
    const entity = await this.em.findOne(ControlQuestionOrmEntity, {
      opportunityId,
      defaultControlQuestionId,
    });
    return entity?.toDomainEntity() ?? null;
  }

  async findById(id: string): Promise<ControlQuestion | null> {
    const entity = await this.em.findOne(ControlQuestionOrmEntity, { id });
    return entity?.toDomainEntity() ?? null;
  }

  async save(entity: ControlQuestion): Promise<void> {
    const primitives = entity.toPrimitives();
    const existing = await this.em.findOne(ControlQuestionOrmEntity, { id: primitives.id });
    if (!existing) {
      await this.em.persistAndFlush(new ControlQuestionOrmEntity(primitives));
      return;
    }
    wrap(existing).assign({ answer: primitives.answer, updatedAt: primitives.updatedAt });
    await this.em.flush();
  }

  async saveMany(entities: ControlQuestion[]): Promise<void> {
    if (!entities.length) return;
    this.em.persist(entities.map((entity) => new ControlQuestionOrmEntity(entity.toPrimitives())));
    await this.em.flush();
  }
}
