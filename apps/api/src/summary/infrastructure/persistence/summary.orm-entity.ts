import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { AiGenerationStatus } from '@tfg/types';
import { Summary } from '../../domain/summary.entity';

@Entity({ tableName: 'summaries' })
export class SummaryOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'uuid', fieldName: 'opportunity_id' }) opportunityId!: string;
  @Property({ type: 'uuid', fieldName: 'summary_template_id' }) summaryTemplateId!: string;
  @Property({ type: 'varchar', length: 255 }) name!: string;
  @Property({ type: 'text' }) prompt!: string;
  @Property({ type: 'text', nullable: true }) result!: string | null;
  @Property({ type: 'varchar', length: 20, fieldName: 'generation_status', default: 'IDLE' })
  generationStatus!: AiGenerationStatus;
  @Property({ type: 'text', nullable: true, fieldName: 'generation_error' }) generationError!: string | null;
  @Property({ type: 'datetime', nullable: true, fieldName: 'generated_at' }) generatedAt!: Date | null;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(params: ReturnType<Summary['toPrimitives']>) {
    Object.assign(this, params);
  }

  toDomainEntity(): Summary {
    return Summary.fromPrimitives(this);
  }
}
