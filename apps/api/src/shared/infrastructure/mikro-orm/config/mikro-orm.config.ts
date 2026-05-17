import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';

export default defineConfig({
  host: process.env['DATABASE_HOST'] ?? 'localhost',
  port: Number(process.env['DATABASE_PORT'] ?? 5432),
  user: process.env['DATABASE_USER'] ?? 'tfg_user',
  password: process.env['DATABASE_PASSWORD'] ?? 'tfg_password',
  dbName: process.env['DATABASE_NAME'] ?? 'tfg_db',
  entities: ['./dist/**/*.orm-entity.js'],
  entitiesTs: ['./src/**/*.orm-entity.ts'],
  forceEntityConstructor: true,
  forceUtcTimezone: true,
  debug: process.env['NODE_ENV'] === 'development',
  discovery: {
    warnWhenNoEntities: false,
  },
  extensions: [Migrator, SeedManager],
  seeder: {
    path: './src/shared/infrastructure/seeds',
    glob: '!(*.d).{js,ts}',
    defaultSeeder: 'DatabaseSeeder',
  },
  migrations: {
    path: './src/shared/infrastructure/mikro-orm/migrations',
    glob: 'Migration*.{js,ts}',
  },
});
