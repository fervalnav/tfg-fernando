import '../setup-env';
import { prepareE2eDatabase } from './e2e-database';

async function start(): Promise<void> {
  await prepareE2eDatabase();
  await import('../../src/main');
}

void start();
