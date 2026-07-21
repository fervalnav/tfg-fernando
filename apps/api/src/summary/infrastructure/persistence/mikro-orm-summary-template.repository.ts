import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { SummaryTemplateRepository } from '../../domain/summary-template.repository';
import { SummaryTemplate } from '../../domain/summary-template.entity';
import { SummaryTemplateOrmEntity } from './summary-template.orm-entity';

@Injectable()
export class MikroOrmSummaryTemplateRepository implements SummaryTemplateRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllByAccountId(accountId: string, page: number, limit: number): Promise<SummaryTemplate[]> {
    const orms = await this.em.find(
      SummaryTemplateOrmEntity,
      { accountId },
      { orderBy: { createdAt: 'ASC' }, limit, offset: (page - 1) * limit },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async countByAccountId(accountId: string): Promise<number> {
    return this.em.count(SummaryTemplateOrmEntity, { accountId });
  }

  async findById(id: string): Promise<SummaryTemplate | null> {
    const orm = await this.em.findOne(SummaryTemplateOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(entity: SummaryTemplate): Promise<void> {
    const p = entity.toPrimitives();
    const existing = await this.em.findOne(SummaryTemplateOrmEntity, { id: p.id });
    if (existing) {
      wrap(existing).assign({ name: p.name, prompt: p.prompt, updatedAt: p.updatedAt });
      await this.em.flush();
      return;
    }
    await this.em.persistAndFlush(new SummaryTemplateOrmEntity(p));
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(SummaryTemplateOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
