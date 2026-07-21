import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { DefaultCustomFieldRepository } from '../../domain/default-custom-field.repository';
import { DefaultCustomField } from '../../domain/default-custom-field.entity';
import { DefaultCustomFieldOrmEntity } from './default-custom-field.orm-entity';

@Injectable()
export class MikroOrmDefaultCustomFieldRepository implements DefaultCustomFieldRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllByAccountId(accountId: string, page: number, limit: number): Promise<DefaultCustomField[]> {
    const orms = await this.em.find(
      DefaultCustomFieldOrmEntity,
      { accountId },
      { orderBy: { createdAt: 'ASC' }, limit, offset: (page - 1) * limit },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async countByAccountId(accountId: string): Promise<number> {
    return this.em.count(DefaultCustomFieldOrmEntity, { accountId });
  }

  async findById(id: string): Promise<DefaultCustomField | null> {
    const orm = await this.em.findOne(DefaultCustomFieldOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(entity: DefaultCustomField): Promise<void> {
    const p = entity.toPrimitives();
    const existing = await this.em.findOne(DefaultCustomFieldOrmEntity, { id: p.id });
    if (existing) {
      wrap(existing).assign({
        name: p.name,
        description: p.description,
        type: p.type,
        classifiers: p.classifiers,
        canSelectMultiple: p.canSelectMultiple,
        automatic: p.automatic,
        aiPrompt: p.aiPrompt,
        updatedAt: p.updatedAt,
      });
      await this.em.flush();
      return;
    }
    await this.em.persistAndFlush(new DefaultCustomFieldOrmEntity(p));
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(DefaultCustomFieldOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
