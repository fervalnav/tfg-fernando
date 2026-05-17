import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Account } from '../../domain/entities/account.entity';

@Entity({ tableName: 'accounts' })
export class AccountOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'varchar', length: 255 })
  name!: string;

  @Property({
    type: 'datetime',
    defaultRaw: 'CURRENT_TIMESTAMP',
    fieldName: 'created_at',
  })
  createdAt!: Date;

  constructor(params: { id: string; name: string; createdAt: Date }) {
    this.id = params.id;
    this.name = params.name;
    this.createdAt = params.createdAt;
  }

  toDomainEntity(): Account {
    return Account.fromPrimitives({
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
    });
  }
}
