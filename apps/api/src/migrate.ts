import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from './shared/infrastructure/mikro-orm/config/mikro-orm.config';

async function migrate(): Promise<void> {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  await orm.close(true);
}

void migrate();
