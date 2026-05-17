import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { AccountOrmEntity } from '../../../auth/infrastructure/persistence/account.orm-entity';
import { AccountMemberOrmEntity } from '../../../auth/infrastructure/persistence/account-member.orm-entity';

export class DevSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingUser = await em.findOne(UserOrmEntity, { email: 'admin@demo.com' });
    if (existingUser) return;

    const accountId = uuidv4();
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash('password123', 12);
    const now = new Date();

    const account = new AccountOrmEntity({ id: accountId, name: 'Demo Account', createdAt: now });
    const user = new UserOrmEntity({
      id: userId,
      email: 'admin@demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Demo',
      avatarUrl: null,
      createdAt: now,
    });
    const member = new AccountMemberOrmEntity({
      id: uuidv4(),
      accountId,
      userId,
      role: 'ADMIN',
      isDefault: true,
      createdAt: now,
    });

    em.persist(account);
    em.persist(user);
    em.persist(member);
    await em.flush();
  }
}
