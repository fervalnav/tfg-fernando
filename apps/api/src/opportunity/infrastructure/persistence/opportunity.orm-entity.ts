import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { FinalOutcomeType } from '../../domain/value-objects/final-outcome-type.vo';
import { Opportunity } from '../../domain/opportunity.entity';

@Entity({ tableName: 'opportunities' })
export class OpportunityOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'account_id' })
  accountId!: string;

  @Property({ type: 'text' })
  title!: string;

  @Property({ type: 'text', nullable: true })
  description!: string | null;

  @Property({ type: 'double', nullable: true })
  amount!: number | null;

  @Property({ type: 'varchar', length: 3, nullable: true })
  currency!: string | null;

  @Property({ type: 'uuid', fieldName: 'pipeline_id' })
  pipelineId!: string;

  @Property({ type: 'uuid', fieldName: 'pipeline_status_id' })
  pipelineStatusId!: string;

  @Property({ type: 'double', fieldName: 'sort_points' })
  sortPoints!: number;

  @Property({ type: 'uuid', nullable: true, fieldName: 'workflow_id' })
  workflowId!: string | null;

  @Property({ type: 'uuid', nullable: true, fieldName: 'workflow_step_id' })
  workflowStepId!: string | null;

  @Property({ type: 'uuid', nullable: true, fieldName: 'organization_id' })
  organizationId!: string | null;

  @Property({ type: 'datetime', nullable: true, fieldName: 'due_date' })
  dueDate!: Date | null;

  @Property({ type: 'varchar', length: 10, nullable: true, fieldName: 'final_outcome_type' })
  finalOutcomeType!: FinalOutcomeType | null;

  @Property({ type: 'datetime', nullable: true, fieldName: 'closed_at' })
  closedAt!: Date | null;

  @Property({ type: 'json', fieldName: 'responsible_user_ids' })
  responsibleUserIds!: string[];

  @Property({ type: 'json', fieldName: 'responsible_team_ids' })
  responsibleTeamIds!: string[];

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(params: {
    id: string;
    accountId: string;
    title: string;
    description: string | null;
    amount: number | null;
    currency: string | null;
    pipelineId: string;
    pipelineStatusId: string;
    sortPoints: number;
    workflowId: string | null;
    workflowStepId: string | null;
    organizationId: string | null;
    dueDate: Date | null;
    finalOutcomeType: FinalOutcomeType | null;
    closedAt: Date | null;
    responsibleUserIds: string[];
    responsibleTeamIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.accountId = params.accountId;
    this.title = params.title;
    this.description = params.description;
    this.amount = params.amount;
    this.currency = params.currency;
    this.pipelineId = params.pipelineId;
    this.pipelineStatusId = params.pipelineStatusId;
    this.sortPoints = params.sortPoints;
    this.workflowId = params.workflowId;
    this.workflowStepId = params.workflowStepId;
    this.organizationId = params.organizationId;
    this.dueDate = params.dueDate;
    this.finalOutcomeType = params.finalOutcomeType;
    this.closedAt = params.closedAt;
    this.responsibleUserIds = params.responsibleUserIds;
    this.responsibleTeamIds = params.responsibleTeamIds;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toDomainEntity(): Opportunity {
    return Opportunity.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      title: this.title,
      description: this.description,
      amount: this.amount,
      currency: this.currency,
      pipelineId: this.pipelineId,
      pipelineStatusId: this.pipelineStatusId,
      sortPoints: this.sortPoints,
      workflowId: this.workflowId,
      workflowStepId: this.workflowStepId,
      organizationId: this.organizationId,
      dueDate: this.dueDate,
      finalOutcomeType: this.finalOutcomeType,
      closedAt: this.closedAt,
      responsibleUserIds: this.responsibleUserIds,
      responsibleTeamIds: this.responsibleTeamIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
