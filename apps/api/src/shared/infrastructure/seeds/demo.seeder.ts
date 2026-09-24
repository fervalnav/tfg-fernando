import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { DevSeeder } from './dev.seeder';

/** Seed estable para preparar exclusivamente el entorno de demostración Tendios. */
export class DemoSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.call(em, [DevSeeder], { demo: true });
  }
}
