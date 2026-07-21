import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import type { CustomFieldType } from '../../domain/default-custom-field.entity';
import { DefaultCustomField } from '../../domain/default-custom-field.entity';

@Entity({ tableName: 'default_custom_fields' })
export class DefaultCustomFieldOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'varchar', length: 255 }) name!: string;
  @Property({ type: 'text', nullable: true }) description!: string | null;
  @Property({ type: 'varchar', length: 20 }) type!: CustomFieldType;
  @Property({ type: 'json' }) classifiers!: string[];
  @Property({ type: 'boolean', fieldName: 'can_select_multiple' }) canSelectMultiple!: boolean;
  @Property({ type: 'boolean' }) automatic!: boolean;
  @Property({ type: 'text', nullable: true, fieldName: 'ai_prompt' }) aiPrompt!: string | null;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(p: {
    id: string;
    accountId: string;
    name: string;
    description: string | null;
    type: CustomFieldType;
    classifiers: string[];
    canSelectMultiple: boolean;
    automatic: boolean;
    aiPrompt: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    Object.assign(this, p);
  }

  toDomainEntity(): DefaultCustomField {
    return DefaultCustomField.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      description: this.description,
      type: this.type,
      classifiers: this.classifiers,
      canSelectMultiple: this.canSelectMultiple,
      automatic: this.automatic,
      aiPrompt: this.aiPrompt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
