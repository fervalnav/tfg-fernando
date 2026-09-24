import type { EntityManager } from '@mikro-orm/core';
import { DemoSeeder } from './demo.seeder';
import { DevSeeder } from './dev.seeder';

describe('DemoSeeder', () => {
  it('delegates to the Tendios demo environment seed', async () => {
    const flush = jest.fn().mockResolvedValue(undefined);
    const fork = { flush } as unknown as EntityManager;
    const em = { fork: jest.fn().mockReturnValue(fork) } as unknown as EntityManager;
    const run = jest.spyOn(DevSeeder.prototype, 'run').mockResolvedValue(undefined);

    try {
      await new DemoSeeder().run(em);
      expect(run).toHaveBeenCalledWith(fork, { demo: true });
      expect(flush).toHaveBeenCalledTimes(1);
    } finally {
      run.mockRestore();
    }
  });
});
