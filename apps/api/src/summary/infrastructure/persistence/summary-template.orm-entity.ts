import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { SummaryTemplate } from '../../domain/summary-template.entity';

@Entity({ tableName: 'summary_templates' })
export class SummaryTemplateOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'varchar', length: 255 }) name!: string;
  @Property({ type: 'text' }) prompt!: string;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  constructor(p: { id: string; accountId: string; name: string; prompt: string; createdAt: Date; updatedAt: Date }) {
    Object.assign(this, p);
  }

  toDomainEntity(): SummaryTemplate {
    return SummaryTemplate.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      prompt: this.prompt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
