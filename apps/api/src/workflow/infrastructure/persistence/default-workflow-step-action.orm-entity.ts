import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { ActionTargetType } from '@tfg/types';
import { DefaultWorkflowStepAction } from '../../domain/default-workflow-step-action.entity';
import { WorkflowStepOrmEntity } from './workflow-step.orm-entity';

@Entity({ tableName: 'default_workflow_step_actions' })
export class DefaultWorkflowStepActionOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => WorkflowStepOrmEntity, { fieldName: 'workflow_step_id' })
  step!: WorkflowStepOrmEntity;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'varchar', length: 50, fieldName: 'target_type' })
  targetType!: ActionTargetType;

  @Property({ type: 'uuid', nullable: true, fieldName: 'target_id' })
  targetId!: string | null;

  @Property({ type: 'json', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Property({ type: 'integer' })
  position!: number;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(params: {
    id: string;
    step: WorkflowStepOrmEntity;
    name: string;
    targetType: ActionTargetType;
    targetId: string | null;
    metadata: Record<string, unknown> | null;
    position: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.step = params.step;
    this.name = params.name;
    this.targetType = params.targetType;
    this.targetId = params.targetId;
    this.metadata = params.metadata;
    this.position = params.position;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toDomainEntity(): DefaultWorkflowStepAction {
    return DefaultWorkflowStepAction.fromPrimitives({
      id: this.id,
      workflowStepId: this.step.id,
      name: this.name,
      targetType: this.targetType,
      targetId: this.targetId,
      metadata: this.metadata,
      position: this.position,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
