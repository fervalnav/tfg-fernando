import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { WorkflowDecisionResultRepository } from '../../domain/workflow-decision-result.repository';
import { WorkflowDecisionResult } from '../../domain/workflow-decision-result.entity';
import { WorkflowDecisionResultOrmEntity } from './workflow-decision-result.orm-entity';

@Injectable()
export class MikroOrmWorkflowDecisionResultRepository implements WorkflowDecisionResultRepository {
  constructor(private readonly em: EntityManager) {}

  async findByOpportunityId(opportunityId: string, accountId: string): Promise<WorkflowDecisionResult[]> {
    const rows = await this.em.find(WorkflowDecisionResultOrmEntity, { opportunityId, accountId });
    return rows.map((row) => row.toDomainEntity());
  }

  async findByOpportunityAndStep(
    opportunityId: string,
    workflowStepId: string,
  ): Promise<WorkflowDecisionResult | null> {
    const row = await this.em.findOne(WorkflowDecisionResultOrmEntity, { opportunityId, workflowStepId });
    return row?.toDomainEntity() ?? null;
  }

  async save(result: WorkflowDecisionResult): Promise<void> {
    const data = result.toPrimitives();
    const existing = await this.em.findOne(WorkflowDecisionResultOrmEntity, { id: data.id });
    if (!existing) {
      await this.em.persistAndFlush(new WorkflowDecisionResultOrmEntity(data));
      return;
    }
    wrap(existing).assign(data);
    await this.em.flush();
  }

  async deleteByOpportunityId(opportunityId: string): Promise<void> {
    await this.em.nativeDelete(WorkflowDecisionResultOrmEntity, { opportunityId });
  }
}
