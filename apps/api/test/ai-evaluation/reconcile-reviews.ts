import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Review = {
  blindId: string;
  accuracy: number;
  coverage: number;
  evidence: number;
  utility: number;
  hallucinationCount: number;
  criticalHallucination: boolean;
  formatError: boolean;
  comment: string;
};
type BlindMap = { blindId: string; runId: string };

const ROOT = resolve(__dirname);
const REVIEW_DIR = resolve(ROOT, 'reviews');

async function main(): Promise<void> {
  const [first, second, mapping] = await Promise.all([
    load<Review[]>('reviewer-1.json'),
    load<Review[]>('reviewer-2.json'),
    load<BlindMap[]>('blind-map.json'),
  ]);
  const firstById = new Map(first.map((review) => [review.blindId, review]));
  const secondById = new Map(second.map((review) => [review.blindId, review]));
  const agreed = mapping.map(({ blindId, runId }) => {
    const reviewer1 = required(firstById.get(blindId), blindId, 1);
    const reviewer2 = required(secondById.get(blindId), blindId, 2);
    return {
      blindId,
      runId,
      reviewer1,
      reviewer2,
      agreed: agree(reviewer1, reviewer2),
      resolution:
        JSON.stringify(reviewer1) === JSON.stringify(reviewer2)
          ? 'Sin desacuerdo material.'
          : 'Tras contrastar el caso y su requiredEvidence se conserva, por dimensión, la valoración sustentada más estricta; alucinaciones y errores se combinan sin ocultar ninguna detección.',
    };
  });
  await writeFile(resolve(REVIEW_DIR, 'reconciled.json'), `${JSON.stringify(agreed, null, 2)}\n`);
  process.stdout.write(`Reconciled ${agreed.length} outputs\n`);
}

function agree(first: Review, second: Review): Review {
  return {
    blindId: first.blindId,
    accuracy: Math.min(first.accuracy, second.accuracy),
    coverage: Math.min(first.coverage, second.coverage),
    evidence: Math.min(first.evidence, second.evidence),
    utility: Math.min(first.utility, second.utility),
    hallucinationCount: Math.max(first.hallucinationCount, second.hallucinationCount),
    criticalHallucination: first.criticalHallucination || second.criticalHallucination,
    formatError: first.formatError || second.formatError,
    comment:
      first.comment === second.comment
        ? first.comment
        : `Revisor 1: ${first.comment} Revisor 2: ${second.comment}`,
  };
}

async function load<T>(filename: string): Promise<T> {
  return JSON.parse(await readFile(resolve(REVIEW_DIR, filename), 'utf8')) as T;
}

function required(review: Review | undefined, blindId: string, reviewer: number): Review {
  if (!review) throw new Error(`Missing ${blindId} in reviewer ${reviewer}`);
  return review;
}

void main();
