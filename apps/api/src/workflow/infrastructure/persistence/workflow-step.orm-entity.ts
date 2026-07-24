import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import type { StepType } from '@tfg/types';
import { WorkflowStep } from '../../domain/workflow-step.entity';
import { WorkflowOrmEntity } from './workflow.orm-entity';
import { DefaultWorkflowStepActionOrmEntity } from './default-workflow-step-action.orm-entity';

@Entity({ tableName: 'workflow_steps' })
export class WorkflowStepOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => WorkflowOrmEntity, { fieldName: 'workflow_id' })
  workflow!: WorkflowOrmEntity;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'varchar', length: 20 })
  type!: StepType;

  @Property({ type: 'text', nullable: true })
  condition!: string | null;

  @Property({ type: 'integer' })
  position!: number;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => DefaultWorkflowStepActionOrmEntity, (a) => a.step, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  actions = new Collection<DefaultWorkflowStepActionOrmEntity>(this);

  constructor(params: {
    id: string;
    workflow: WorkflowOrmEntity;
    name: string;
    type: StepType;
    condition: string | null;
    position: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.workflow = params.workflow;
    this.name = params.name;
    this.type = params.type;
    this.condition = params.condition;
    this.position = params.position;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toDomainEntity(): WorkflowStep {
    return WorkflowStep.fromPrimitives({
      id: this.id,
      workflowId: this.workflow.id,
      name: this.name,
      type: this.type,
      condition: this.condition,
      position: this.position,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
