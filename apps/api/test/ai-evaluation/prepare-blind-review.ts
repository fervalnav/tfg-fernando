import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type RawResult = {
  runId: string;
  caseId: string;
  operation: string;
  validSchema: boolean;
  output: unknown;
  error: string | null;
};

const ROOT = resolve(__dirname);
const RESULTS_DIR = resolve(ROOT, 'results');
const REVIEW_DIR = resolve(ROOT, 'reviews');

async function main(): Promise<void> {
  const raw = (await readFile(resolve(RESULTS_DIR, 'raw-results.jsonl'), 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as RawResult);
  const ordered = raw
    .map((result) => ({ result, blindId: blindId(result.runId) }))
    .sort((left, right) => left.blindId.localeCompare(right.blindId));

  await mkdir(REVIEW_DIR, { recursive: true });
  await writeFile(
    resolve(REVIEW_DIR, 'blind-outputs.json'),
    `${JSON.stringify(
      ordered.map(({ result, blindId: id }) => ({
        blindId: id,
        caseId: result.caseId,
        operation: result.operation,
        validSchema: result.validSchema,
        output: result.output,
        error: result.error,
      })),
      null,
      2,
    )}\n`,
  );
  await writeFile(
    resolve(REVIEW_DIR, 'blind-map.json'),
    `${JSON.stringify(ordered.map(({ result, blindId: id }) => ({ blindId: id, runId: result.runId })), null, 2)}\n`,
  );
  process.stdout.write(`Prepared ${ordered.length} blinded outputs\n`);
}

function blindId(runId: string): string {
  return `blind-${createHash('sha256').update(`lia-review-v2|${runId}`).digest('hex').slice(0, 12)}`;
}

void main();
