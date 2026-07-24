import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Workflow } from '../../domain/workflow.entity';
import { WorkflowStepOrmEntity } from './workflow-step.orm-entity';

@Entity({ tableName: 'workflows' })
export class WorkflowOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'account_id' })
  accountId!: string;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description!: string | null;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => WorkflowStepOrmEntity, (s) => s.workflow, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  steps = new Collection<WorkflowStepOrmEntity>(this);

  constructor(params: {
    id: string;
    accountId: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.accountId = params.accountId;
    this.name = params.name;
    this.description = params.description;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toDomainEntity(): Workflow {
    return Workflow.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
