import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { CustomFieldRepository } from '../../domain/custom-field.repository';
import type { CustomField } from '../../domain/custom-field.entity';
import { CustomFieldOrmEntity } from './custom-field.orm-entity';

@Injectable()
export class MikroOrmCustomFieldRepository implements CustomFieldRepository {
  constructor(private readonly em: EntityManager) {}

  async findByOpportunityId(opportunityId: string, accountId: string): Promise<CustomField[]> {
    const entities = await this.em.find(
      CustomFieldOrmEntity,
      { opportunityId, accountId },
      { orderBy: { createdAt: 'ASC' } },
    );
    return entities.map((entity) => entity.toDomainEntity());
  }

  async findByOpportunityAndDefaultId(
    opportunityId: string,
    defaultCustomFieldId: string,
  ): Promise<CustomField | null> {
    const entity = await this.em.findOne(CustomFieldOrmEntity, {
      opportunityId,
      defaultCustomFieldId,
    });
    return entity?.toDomainEntity() ?? null;
  }

  async findById(id: string): Promise<CustomField | null> {
    const entity = await this.em.findOne(CustomFieldOrmEntity, { id });
    return entity?.toDomainEntity() ?? null;
  }

  async save(entity: CustomField): Promise<void> {
    const primitives = entity.toPrimitives();
    const existing = await this.em.findOne(CustomFieldOrmEntity, { id: primitives.id });
    if (!existing) {
      await this.em.persistAndFlush(new CustomFieldOrmEntity(primitives));
      return;
    }
    wrap(existing).assign({ value: primitives.value, updatedAt: primitives.updatedAt });
    await this.em.flush();
  }

  async saveMany(entities: CustomField[]): Promise<void> {
    if (!entities.length) return;
    this.em.persist(entities.map((entity) => new CustomFieldOrmEntity(entity.toPrimitives())));
    await this.em.flush();
  }
}
