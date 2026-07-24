import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { DefaultWorkflowStepActionRepository } from '../../domain/default-workflow-step-action.repository';
import { DefaultWorkflowStepAction } from '../../domain/default-workflow-step-action.entity';
import { DefaultWorkflowStepActionOrmEntity } from './default-workflow-step-action.orm-entity';
import { WorkflowStepOrmEntity } from './workflow-step.orm-entity';

@Injectable()
export class MikroOrmDefaultWorkflowStepActionRepository implements DefaultWorkflowStepActionRepository {
  constructor(private readonly em: EntityManager) {}

  async findByWorkflowStepIds(stepIds: string[]): Promise<DefaultWorkflowStepAction[]> {
    if (!stepIds.length) return [];
    const orms = await this.em.find(
      DefaultWorkflowStepActionOrmEntity,
      { step: { id: { $in: stepIds } } },
      { orderBy: { position: 'ASC' } },
    );
    return orms.map((o) => o.toDomainEntity());
  }

  async findById(id: string): Promise<DefaultWorkflowStepAction | null> {
    const orm = await this.em.findOne(DefaultWorkflowStepActionOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async save(action: DefaultWorkflowStepAction): Promise<void> {
    const primitives = action.toPrimitives();
    const existing = await this.em.findOne(DefaultWorkflowStepActionOrmEntity, { id: primitives.id });
    if (existing) {
      wrap(existing).assign({
        name: primitives.name,
        targetType: primitives.targetType,
        targetId: primitives.targetId,
        metadata: primitives.metadata,
        position: primitives.position,
        updatedAt: primitives.updatedAt,
      });
      await this.em.flush();
      return;
    }
    const stepRef = this.em.getReference(WorkflowStepOrmEntity, primitives.workflowStepId);
    const orm = new DefaultWorkflowStepActionOrmEntity({
      id: primitives.id,
      step: stepRef,
      name: primitives.name,
      targetType: primitives.targetType,
      targetId: primitives.targetId,
      metadata: primitives.metadata,
      position: primitives.position,
      createdAt: primitives.createdAt,
      updatedAt: primitives.updatedAt,
    });
    await this.em.persistAndFlush(orm);
  }

  async delete(id: string): Promise<void> {
    const orm = await this.em.findOne(DefaultWorkflowStepActionOrmEntity, { id });
    if (orm) await this.em.removeAndFlush(orm);
  }
}
