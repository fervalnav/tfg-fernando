import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { WorkflowStepActionRepository } from '../../domain/workflow-step-action.repository';
import { WorkflowStepAction } from '../../domain/workflow-step-action.entity';
import { WorkflowStepActionOrmEntity } from './workflow-step-action.orm-entity';

@Injectable()
export class MikroOrmWorkflowStepActionRepository implements WorkflowStepActionRepository {
  constructor(private readonly em: EntityManager) {}

  async findByOpportunityId(opportunityId: string, accountId: string): Promise<WorkflowStepAction[]> {
    const rows = await this.em.find(
      WorkflowStepActionOrmEntity,
      { opportunityId, accountId },
      { orderBy: { position: 'ASC' } },
    );
    return rows.map((row) => row.toDomainEntity());
  }

  async findByOpportunityAndStep(opportunityId: string, workflowStepId: string): Promise<WorkflowStepAction[]> {
    const rows = await this.em.find(
      WorkflowStepActionOrmEntity,
      { opportunityId, workflowStepId },
      { orderBy: { position: 'ASC' } },
    );
    return rows.map((row) => row.toDomainEntity());
  }

  async findById(id: string, opportunityId: string): Promise<WorkflowStepAction | null> {
    const row = await this.em.findOne(WorkflowStepActionOrmEntity, { id, opportunityId });
    return row?.toDomainEntity() ?? null;
  }

  async save(action: WorkflowStepAction): Promise<void> {
    const data = action.toPrimitives();
    const existing = await this.em.findOne(WorkflowStepActionOrmEntity, { id: data.id });
    if (!existing) {
      await this.em.persistAndFlush(new WorkflowStepActionOrmEntity(data));
      return;
    }
    wrap(existing).assign(data);
    await this.em.flush();
  }

  async saveMany(actions: WorkflowStepAction[]): Promise<void> {
    for (const action of actions) {
      const data = action.toPrimitives();
      const existing = await this.em.findOne(WorkflowStepActionOrmEntity, { id: data.id });
      if (existing) wrap(existing).assign(data);
      else this.em.persist(new WorkflowStepActionOrmEntity(data));
    }
    await this.em.flush();
  }

  async deleteByOpportunityId(opportunityId: string): Promise<void> {
    await this.em.nativeDelete(WorkflowStepActionOrmEntity, { opportunityId });
  }
}
