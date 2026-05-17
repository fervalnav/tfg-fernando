import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';

@Entity({ tableName: 'refresh_tokens' })
export class RefreshTokenOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'uuid', fieldName: 'user_id' })
  userId!: string;

  @Property({ type: 'varchar', length: 255, fieldName: 'token_hash' })
  tokenHash!: string;

  @Property({ type: 'datetime', fieldName: 'expires_at' })
  expiresAt!: Date;

  @Property({ type: 'datetime', nullable: true, fieldName: 'revoked_at' })
  revokedAt!: Date | null;

  @Property({
    type: 'datetime',
    defaultRaw: 'CURRENT_TIMESTAMP',
    fieldName: 'created_at',
  })
  createdAt!: Date;

  constructor(params: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.tokenHash = params.tokenHash;
    this.expiresAt = params.expiresAt;
    this.revokedAt = params.revokedAt;
    this.createdAt = params.createdAt;
  }

  toDomainEntity(): RefreshToken {
    return RefreshToken.fromPrimitives({
      id: this.id,
      userId: this.userId,
      tokenHash: this.tokenHash,
      expiresAt: this.expiresAt,
      revokedAt: this.revokedAt,
      createdAt: this.createdAt,
    });
  }
}
