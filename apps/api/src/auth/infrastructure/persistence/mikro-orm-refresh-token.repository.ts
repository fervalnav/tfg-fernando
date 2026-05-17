import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { RefreshTokenRepository } from '../../domain/repositories/refresh-token.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenOrmEntity } from './refresh-token.orm-entity';

@Injectable()
export class MikroOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly em: EntityManager) {}

  async save(token: RefreshToken): Promise<void> {
    const orm = new RefreshTokenOrmEntity(token.toPrimitives());
    await this.em.persistAndFlush(orm);
  }

  async findByTokenHash(hash: string): Promise<RefreshToken | null> {
    const orm = await this.em.findOne(RefreshTokenOrmEntity, {
      tokenHash: hash,
    });
    return orm ? orm.toDomainEntity() : null;
  }

  async update(token: RefreshToken): Promise<void> {
    const primitives = token.toPrimitives();
    const ref = this.em.getReference(RefreshTokenOrmEntity, primitives.id);
    wrap(ref).assign({ revokedAt: primitives.revokedAt });
    await this.em.flush();
  }

  async revokeAllByUser(userId: string): Promise<void> {
    await this.em.nativeUpdate(RefreshTokenOrmEntity, { userId, revokedAt: null }, { revokedAt: new Date() });
  }
}
