import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { OutcomeType } from '../../domain/value-objects/outcome-type.vo';
import { PipelineStatus } from '../../domain/pipeline-status.entity';
import { PipelineOrmEntity } from './pipeline.orm-entity';

@Entity({ tableName: 'pipeline_statuses' })
export class PipelineStatusOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => PipelineOrmEntity, { fieldName: 'pipeline_id' })
  pipeline!: PipelineOrmEntity;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description!: string | null;

  @Property({ type: 'varchar', length: 7, nullable: true, fieldName: 'background_color' })
  backgroundColor!: string | null;

  @Property({ type: 'varchar', length: 7, nullable: true, fieldName: 'text_color' })
  textColor!: string | null;

  @Property({ type: 'boolean', fieldName: 'is_initial' })
  isInitial!: boolean;

  @Property({ type: 'boolean', fieldName: 'is_terminal' })
  isTerminal!: boolean;

  @Property({ type: 'varchar', length: 10, fieldName: 'outcome_type' })
  outcomeType!: OutcomeType;

  @Property({ type: 'boolean', fieldName: 'show_in_kanban' })
  showInKanban!: boolean;

  @Property({ type: 'integer', fieldName: 'sort_points' })
  sortPoints!: number;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(params: {
    id: string;
    pipeline: PipelineOrmEntity;
    name: string;
    description: string | null;
    backgroundColor: string | null;
    textColor: string | null;
    isInitial: boolean;
    isTerminal: boolean;
    outcomeType: OutcomeType;
    showInKanban: boolean;
    sortPoints: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = params.id;
    this.pipeline = params.pipeline;
    this.name = params.name;
    this.description = params.description;
    this.backgroundColor = params.backgroundColor;
    this.textColor = params.textColor;
    this.isInitial = params.isInitial;
    this.isTerminal = params.isTerminal;
    this.outcomeType = params.outcomeType;
    this.showInKanban = params.showInKanban;
    this.sortPoints = params.sortPoints;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toDomainEntity(): PipelineStatus {
    return PipelineStatus.fromPrimitives({
      id: this.id,
      pipelineId: this.pipeline.id,
      name: this.name,
      description: this.description,
      backgroundColor: this.backgroundColor,
      textColor: this.textColor,
      isInitial: this.isInitial,
      isTerminal: this.isTerminal,
      outcomeType: this.outcomeType,
      showInKanban: this.showInKanban,
      sortPoints: this.sortPoints,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
