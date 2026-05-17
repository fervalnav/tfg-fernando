import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { InvitationTokenRepository } from '../../domain/repositories/invitation-token.repository';
import { InvitationToken } from '../../domain/entities/invitation-token.entity';
import { InvitationTokenOrmEntity } from './invitation-token.orm-entity';

@Injectable()
export class MikroOrmInvitationTokenRepository implements InvitationTokenRepository {
  constructor(private readonly em: EntityManager) {}

  async save(token: InvitationToken): Promise<void> {
    const orm = new InvitationTokenOrmEntity(token.toPrimitives());
    await this.em.persistAndFlush(orm);
  }

  async findByTokenHash(hash: string): Promise<InvitationToken | null> {
    const orm = await this.em.findOne(InvitationTokenOrmEntity, {
      tokenHash: hash,
    });
    return orm ? orm.toDomainEntity() : null;
  }

  async update(token: InvitationToken): Promise<void> {
    const primitives = token.toPrimitives();
    const ref = this.em.getReference(InvitationTokenOrmEntity, primitives.id);
    wrap(ref).assign({ usedAt: primitives.usedAt });
    await this.em.flush();
  }
}
