import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { WorkflowDecisionStatus } from '@tfg/types';
import { WorkflowDecisionResult } from '../../domain/workflow-decision-result.entity';

@Entity({ tableName: 'workflow_decision_results' })
export class WorkflowDecisionResultOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'uuid', fieldName: 'opportunity_id' }) opportunityId!: string;
  @Property({ type: 'uuid', fieldName: 'workflow_step_id' }) workflowStepId!: string;
  @Property({ type: 'varchar', length: 20 }) status!: WorkflowDecisionStatus;
  @Property({ type: 'text', nullable: true }) evidence!: string | null;
  @Property({ type: 'datetime', nullable: true, fieldName: 'evaluated_at' }) evaluatedAt!: Date | null;
  @Property({ type: 'datetime', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', fieldName: 'updated_at' }) updatedAt!: Date;

  constructor(params: ReturnType<WorkflowDecisionResult['toPrimitives']>) {
    Object.assign(this, params);
  }

  toDomainEntity(): WorkflowDecisionResult {
    return WorkflowDecisionResult.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      opportunityId: this.opportunityId,
      workflowStepId: this.workflowStepId,
      status: this.status,
      evidence: this.evidence,
      evaluatedAt: this.evaluatedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
