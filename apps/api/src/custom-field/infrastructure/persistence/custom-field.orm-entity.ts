import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { AiGenerationStatus, CustomFieldType, CustomFieldValue } from '@tfg/types';
import { CustomField } from '../../domain/custom-field.entity';

@Entity({ tableName: 'custom_fields' })
export class CustomFieldOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'uuid', fieldName: 'opportunity_id' }) opportunityId!: string;
  @Property({ type: 'uuid', fieldName: 'default_custom_field_id' }) defaultCustomFieldId!: string;
  @Property({ type: 'varchar', length: 255 }) name!: string;
  @Property({ type: 'text', nullable: true }) description!: string | null;
  @Property({ type: 'varchar', length: 20 }) type!: CustomFieldType;
  @Property({ type: 'json' }) classifiers!: string[];
  @Property({ type: 'boolean', fieldName: 'can_select_multiple' }) canSelectMultiple!: boolean;
  @Property({ type: 'boolean' }) automatic!: boolean;
  @Property({ type: 'text', nullable: true, fieldName: 'ai_prompt' }) aiPrompt!: string | null;
  @Property({ type: 'json', nullable: true }) value!: CustomFieldValue;
  @Property({ type: 'varchar', length: 20, fieldName: 'ai_status', default: 'IDLE' })
  aiStatus!: AiGenerationStatus;
  @Property({ type: 'text', nullable: true, fieldName: 'ai_error' }) aiError!: string | null;
  @Property({ type: 'text', nullable: true, fieldName: 'ai_evidence' }) aiEvidence!: string | null;
  @Property({ type: 'datetime', nullable: true, fieldName: 'ai_generated_at' }) aiGeneratedAt!: Date | null;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(params: ReturnType<CustomField['toPrimitives']>) {
    Object.assign(this, params);
  }

  toDomainEntity(): CustomField {
    return CustomField.fromPrimitives(this);
  }
}
