import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/core';
import { AccountMemberRepository } from '../../domain/repositories/account-member.repository';
import { AccountMember } from '../../domain/entities/account-member.entity';
import { AccountMemberOrmEntity } from './account-member.orm-entity';

@Injectable()
export class MikroOrmAccountMemberRepository implements AccountMemberRepository {
  constructor(private readonly em: EntityManager) {}

  async save(member: AccountMember): Promise<void> {
    const primitives = member.toPrimitives();
    const existing = await this.em.findOne(AccountMemberOrmEntity, {
      id: primitives.id,
    });
    if (existing) {
      wrap(existing).assign({
        role: primitives.role,
        isDefault: primitives.isDefault,
      });
      await this.em.flush();
      return;
    }
    const orm = new AccountMemberOrmEntity(primitives);
    await this.em.persistAndFlush(orm);
  }

  async findByUserAndAccount(userId: string, accountId: string): Promise<AccountMember | null> {
    const orm = await this.em.findOne(AccountMemberOrmEntity, {
      userId,
      accountId,
    });
    return orm ? orm.toDomainEntity() : null;
  }

  async findDefaultByUser(userId: string): Promise<AccountMember | null> {
    const orm = await this.em.findOne(AccountMemberOrmEntity, {
      userId,
      isDefault: true,
    });
    return orm ? orm.toDomainEntity() : null;
  }

  async findAllByAccount(accountId: string): Promise<AccountMember[]> {
    const orms = await this.em.find(AccountMemberOrmEntity, { accountId });
    return orms.map((o) => o.toDomainEntity());
  }

  async findAllByUser(userId: string): Promise<AccountMember[]> {
    const orms = await this.em.find(AccountMemberOrmEntity, { userId });
    return orms.map((o) => o.toDomainEntity());
  }

  async delete(id: string): Promise<void> {
    const ref = this.em.getReference(AccountMemberOrmEntity, id);
    await this.em.removeAndFlush(ref);
  }

  async clearDefaultForUser(userId: string): Promise<void> {
    await this.em.nativeUpdate(AccountMemberOrmEntity, { userId, isDefault: true }, { isDefault: false });
  }
}
