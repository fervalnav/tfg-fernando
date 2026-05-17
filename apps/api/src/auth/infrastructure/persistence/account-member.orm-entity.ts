import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { AccountMember } from '../../domain/entities/account-member.entity';
import type { AccountMemberRole } from '../../domain/value-objects/account-member-role.value-object';

@Entity({ tableName: 'account_members' })
export class AccountMemberOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'account_id' })
  accountId!: string;

  @Property({ type: 'uuid', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'varchar', length: 20 })
  role!: AccountMemberRole;

  @Property({ type: 'boolean', fieldName: 'is_default', default: false })
  isDefault!: boolean;

  @Property({
    type: 'datetime',
    defaultRaw: 'CURRENT_TIMESTAMP',
    fieldName: 'created_at',
  })
  createdAt!: Date;

  constructor(params: {
    id: string;
    accountId: string;
    userId: string;
    role: AccountMemberRole;
    isDefault: boolean;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.accountId = params.accountId;
    this.userId = params.userId;
    this.role = params.role;
    this.isDefault = params.isDefault;
    this.createdAt = params.createdAt;
  }

  toDomainEntity(): AccountMember {
    return AccountMember.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      userId: this.userId,
      role: this.role,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
    });
  }
}
