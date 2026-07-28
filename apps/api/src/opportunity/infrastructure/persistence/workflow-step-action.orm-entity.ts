import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { ActionTargetType, WorkflowStepActionStatus } from '@tfg/types';
import { WorkflowStepAction } from '../../domain/workflow-step-action.entity';

@Entity({ tableName: 'workflow_step_actions' })
export class WorkflowStepActionOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'uuid', fieldName: 'opportunity_id' }) opportunityId!: string;
  @Property({ type: 'uuid', fieldName: 'workflow_step_id' }) workflowStepId!: string;
  @Property({ type: 'uuid', fieldName: 'default_workflow_step_action_id' }) defaultWorkflowStepActionId!: string;
  @Property({ type: 'varchar', length: 255 }) name!: string;
  @Property({ type: 'varchar', length: 50, fieldName: 'target_type' }) targetType!: ActionTargetType;
  @Property({ type: 'uuid', nullable: true, fieldName: 'target_id' }) targetId!: string | null;
  @Property({ type: 'json', nullable: true }) metadata!: Record<string, unknown> | null;
  @Property({ type: 'integer' }) position!: number;
  @Property({ type: 'varchar', length: 20 }) status!: WorkflowStepActionStatus;
  @Property({ type: 'text', nullable: true, fieldName: 'error_message' }) errorMessage!: string | null;
  @Property({ type: 'datetime', nullable: true, fieldName: 'completed_at' }) completedAt!: Date | null;
  @Property({ type: 'datetime', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', fieldName: 'updated_at' }) updatedAt!: Date;

  constructor(params: ReturnType<WorkflowStepAction['toPrimitives']>) {
    Object.assign(this, params);
  }

  toDomainEntity(): WorkflowStepAction {
    return WorkflowStepAction.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      opportunityId: this.opportunityId,
      workflowStepId: this.workflowStepId,
      defaultWorkflowStepActionId: this.defaultWorkflowStepActionId,
      name: this.name,
      targetType: this.targetType,
      targetId: this.targetId,
      metadata: this.metadata,
      position: this.position,
      status: this.status,
      errorMessage: this.errorMessage,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
