import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { InvitationToken } from '../../domain/entities/invitation-token.entity';
import type { AccountMemberRole } from '../../domain/value-objects/account-member-role.value-object';

@Entity({ tableName: 'invitation_tokens' })
export class InvitationTokenOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'account_id' })
  accountId!: string;

  @Property({ type: 'varchar', length: 255 })
  email!: string;

  @Property({ type: 'varchar', length: 20 })
  role!: AccountMemberRole;

  @Property({ type: 'varchar', length: 255, fieldName: 'token_hash' })
  tokenHash!: string;

  @Property({ type: 'datetime', fieldName: 'expires_at' })
  expiresAt!: Date;

  @Property({ type: 'datetime', nullable: true, fieldName: 'used_at' })
  usedAt!: Date | null;

  @Property({
    type: 'datetime',
    defaultRaw: 'CURRENT_TIMESTAMP',
    fieldName: 'created_at',
  })
  createdAt!: Date;

  constructor(params: {
    id: string;
    accountId: string;
    email: string;
    role: AccountMemberRole;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.accountId = params.accountId;
    this.email = params.email;
    this.role = params.role;
    this.tokenHash = params.tokenHash;
    this.expiresAt = params.expiresAt;
    this.usedAt = params.usedAt;
    this.createdAt = params.createdAt;
  }

  toDomainEntity(): InvitationToken {
    return InvitationToken.fromPrimitives({
      id: this.id,
      accountId: this.accountId,
      email: this.email,
      role: this.role,
      tokenHash: this.tokenHash,
      expiresAt: this.expiresAt,
      usedAt: this.usedAt,
      createdAt: this.createdAt,
    });
  }
}
