import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { DefaultControlQuestionRepository } from '../../domain/default-control-question.repository';
import { DefaultControlQuestion } from '../../domain/default-control-question.entity';
import { DefaultControlQuestionOrmEntity } from './default-control-question.orm-entity';

@Injectable()
export class MikroOrmDefaultControlQuestionRepository implements DefaultControlQuestionRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllByAccountId(accountId: string, page: number, limit: number): Promise<DefaultControlQuestion[]> {
    const orms = await this.em.find(
      DefaultControlQuestionOrmEntity,
      { accountId },
      { orderBy: { createdAt: 'ASC' }, limit, offset: (page - 1) * limit },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async countByAccountId(accountId: string): Promise<number> {
    return this.em.count(DefaultControlQuestionOrmEntity, { accountId });
  }

  async findById(id: string): Promise<DefaultControlQuestion | null> {
    const orm = await this.em.findOne(DefaultControlQuestionOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(entity: DefaultControlQuestion): Promise<void> {
    const p = entity.toPrimitives();
    const existing = await this.em.findOne(DefaultControlQuestionOrmEntity, { id: p.id });
    if (existing) {
      wrap(existing).assign({
        question: p.question,
        answerType: p.answerType,
        passConditionPrompt: p.passConditionPrompt,
        updatedAt: p.updatedAt,
      });
      await this.em.flush();
      return;
    }
    await this.em.persistAndFlush(new DefaultControlQuestionOrmEntity(p));
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(DefaultControlQuestionOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
