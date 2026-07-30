import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Attachment } from '../../domain/attachment.entity';

@Entity({ tableName: 'attachments' })
export class AttachmentOrmEntity {
  @PrimaryKey({ type: 'uuid' }) id!: string;
  @Property({ type: 'uuid', fieldName: 'account_id' }) accountId!: string;
  @Property({ type: 'uuid', fieldName: 'opportunity_id' }) opportunityId!: string;
  @Property({ type: 'uuid', nullable: true, fieldName: 'workflow_step_action_id' })
  workflowStepActionId!: string | null;
  @Property({ type: 'varchar', length: 255 }) name!: string;
  @Property({ type: 'text', nullable: true }) description!: string | null;
  @Property({ type: 'varchar', length: 150, fieldName: 'mime_type' }) mimeType!: string;
  @Property({ type: 'integer' }) size!: number;
  @Property({ type: 'varchar', length: 1024, fieldName: 'file_key', unique: true }) fileKey!: string;
  @Property({ type: 'datetime', fieldName: 'created_at' }) createdAt!: Date;
  @Property({ type: 'datetime', fieldName: 'updated_at' }) updatedAt!: Date;

  constructor(params: ReturnType<Attachment['toPrimitives']>) {
    Object.assign(this, {
      ...params,
      createdAt: new Date(params.createdAt.epochMilliseconds),
      updatedAt: new Date(params.updatedAt.epochMilliseconds),
    });
  }

  toDomainEntity(): Attachment {
    return Attachment.fromPrimitives({
      ...this,
      createdAt: Temporal.Instant.fromEpochMilliseconds(this.createdAt.getTime()),
      updatedAt: Temporal.Instant.fromEpochMilliseconds(this.updatedAt.getTime()),
    });
  }
}
