import { MikroORM } from '@mikro-orm/postgresql';
import mikroOrmConfig from '../../src/shared/infrastructure/mikro-orm/config/mikro-orm.config';

const TEST_DATABASE_NAME = process.env['DATABASE_NAME'] ?? 'tfg_e2e';

export async function prepareE2eDatabase(): Promise<void> {
  if (!/^tfg_[a-z0-9_]*e2e[a-z0-9_]*$/u.test(TEST_DATABASE_NAME)) {
    throw new Error(`Refusing to prepare unsafe E2E database name: ${TEST_DATABASE_NAME}`);
  }

  const admin = await MikroORM.init({ ...mikroOrmConfig, dbName: 'postgres' });
  try {
    const existing = await admin.em
      .getConnection()
      .execute<
        { exists: boolean }[]
      >('select exists(select 1 from pg_database where datname = ?) as exists', [TEST_DATABASE_NAME]);
    if (!existing[0]?.exists) {
      await admin.em.getConnection().execute(`create database "${TEST_DATABASE_NAME}"`);
    }
  } finally {
    await admin.close(true);
  }

  const testOrm = await MikroORM.init(mikroOrmConfig);
  try {
    await testOrm.getSchemaGenerator().refreshDatabase();
  } finally {
    await testOrm.close(true);
  }
}
