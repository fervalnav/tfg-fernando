import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class MikroOrmUserRepository implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async save(user: User): Promise<void> {
    const primitives = user.toPrimitives();
    const existing = await this.em.findOne(UserOrmEntity, {
      id: primitives.id,
    });
    if (existing) {
      wrap(existing).assign({
        passwordHash: primitives.passwordHash,
        firstName: primitives.firstName,
        lastName: primitives.lastName,
        avatarUrl: primitives.avatarUrl,
      });
      await this.em.flush();
      return;
    }
    const orm = new UserOrmEntity(primitives);
    await this.em.persistAndFlush(orm);
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.em.findOne(UserOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.em.findOne(UserOrmEntity, { email });
    return orm ? orm.toDomainEntity() : null;
  }
}
