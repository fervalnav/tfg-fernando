import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { Account } from '../../domain/entities/account.entity';
import { AccountOrmEntity } from './account.orm-entity';

@Injectable()
export class MikroOrmAccountRepository implements AccountRepository {
  constructor(private readonly em: EntityManager) {}

  async save(account: Account): Promise<void> {
    const primitives = account.toPrimitives();
    const orm = new AccountOrmEntity(primitives);
    await this.em.persistAndFlush(orm);
  }

  async findById(id: string): Promise<Account | null> {
    const orm = await this.em.findOne(AccountOrmEntity, { id });
    return orm ? orm.toDomainEntity() : null;
  }
}
