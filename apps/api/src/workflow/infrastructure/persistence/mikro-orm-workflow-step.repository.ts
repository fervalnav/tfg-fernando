import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { WorkflowStepRepository } from '../../domain/workflow-step.repository';
import { WorkflowStep } from '../../domain/workflow-step.entity';
import { WorkflowStepOrmEntity } from './workflow-step.orm-entity';
import { WorkflowOrmEntity } from './workflow.orm-entity';

@Injectable()
export class MikroOrmWorkflowStepRepository implements WorkflowStepRepository {
  constructor(private readonly em: EntityManager) {}

  async findByWorkflowId(workflowId: string): Promise<WorkflowStep[]> {
    const orms = await this.em.find(
      WorkflowStepOrmEntity,
      { workflow: { id: workflowId } },
      {
        orderBy: { position: 'ASC' },
      },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async findById(id: string): Promise<WorkflowStep | null> {
    const orm = await this.em.findOne(WorkflowStepOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async saveMany(steps: WorkflowStep[]): Promise<void> {
    for (const step of steps) {
      const primitives = step.toPrimitives();
      const existing = await this.em.findOne(WorkflowStepOrmEntity, { id: primitives.id });
      if (existing) {
        wrap(existing).assign({
          name: primitives.name,
          type: primitives.type,
          condition: primitives.condition,
          position: primitives.position,
          updatedAt: primitives.updatedAt,
        });
      } else {
        const workflowRef = this.em.getReference(WorkflowOrmEntity, primitives.workflowId);
        this.em.persist(
          new WorkflowStepOrmEntity({
            id: primitives.id,
            workflow: workflowRef,
            name: primitives.name,
            type: primitives.type,
            condition: primitives.condition,
            position: primitives.position,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
          }),
        );
      }
    }
    await this.em.flush();
  }

  async deleteMany(ids: string[]): Promise<void> {
    const orms = await this.em.find(WorkflowStepOrmEntity, { id: { $in: ids } });
    for (const orm of orms) this.em.remove(orm);
    await this.em.flush();
  }
}
