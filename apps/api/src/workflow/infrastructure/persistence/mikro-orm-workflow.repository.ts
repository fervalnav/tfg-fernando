import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { WorkflowRepository } from '../../domain/workflow.repository';
import { Workflow } from '../../domain/workflow.entity';
import { WorkflowOrmEntity } from './workflow.orm-entity';

@Injectable()
export class MikroOrmWorkflowRepository implements WorkflowRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllByAccountId(accountId: string, page: number, limit: number): Promise<Workflow[]> {
    const offset = (page - 1) * limit;
    const orms = await this.em.find(
      WorkflowOrmEntity,
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
    return this.em.count(WorkflowOrmEntity, { accountId });
  }

  async findById(id: string): Promise<Workflow | null> {
    const orm = await this.em.findOne(WorkflowOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(workflow: Workflow): Promise<void> {
    const primitives = workflow.toPrimitives();
    const existing = await this.em.findOne(WorkflowOrmEntity, { id: primitives.id });
    if (existing) {
      wrap(existing).assign({
        name: primitives.name,
        description: primitives.description,
        updatedAt: primitives.updatedAt,
      });
      await this.em.flush();
      return;
    }
    const orm = new WorkflowOrmEntity(primitives);
    await this.em.persistAndFlush(orm);
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(WorkflowOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
