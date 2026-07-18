import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Pipeline } from '../../domain/pipeline.entity';
import { PipelineStatusOrmEntity } from './pipeline-status.orm-entity';

@Entity({ tableName: 'pipelines' })
export class PipelineOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'account_id' })
  accountId!: string;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at' })
  createdAt!: Date;

  @Property({ type: 'datetime', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'updated_at', onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(() => PipelineStatusOrmEntity, (s) => s.pipeline, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
  })
  statuses = new Collection<PipelineStatusOrmEntity>(this);

  constructor(params: { id: string; accountId: string; name: string; createdAt: Date; updatedAt: Date }) {
    this.id = params.id;
    this.accountId = params.accountId;
    this.name = params.name;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toDomainEntity(): Pipeline {
    return Pipeline.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
