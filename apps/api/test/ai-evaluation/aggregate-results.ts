import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Raw = {
  runId: string;
  model: string;
  operation: string;
  durationMs: number | null;
  usage: { inputTokens: number | null; outputTokens: number | null };
  cost: number | null;
  validSchema: boolean;
};
type Reconciled = {
  runId: string;
  agreed: {
    accuracy: number;
    coverage: number;
    evidence: number;
    utility: number;
    hallucinationCount: number;
    criticalHallucination: boolean;
    formatError: boolean;
  };
};

const ROOT = resolve(__dirname);

async function main(): Promise<void> {
  const raw = (await readFile(resolve(ROOT, 'results/raw-results.jsonl'), 'utf8'))
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Raw);
  const reconciled = JSON.parse(await readFile(resolve(ROOT, 'reviews/reconciled.json'), 'utf8')) as Reconciled[];
  const scores = new Map(reconciled.map((review) => [review.runId, review.agreed]));
  const models = [...new Set(raw.map((result) => result.model))];
  const summary = models.map((model) => {
    const results = raw.filter((result) => result.model === model);
    const reviewed = results.map((result) => ({ result, score: scores.get(result.runId) })).filter(hasScore);
    const durations = reviewed.map(({ result }) => result.durationMs).filter(isNumber).sort((a, b) => a - b);
    return {
      model,
      completed: results.length,
      planned: 60,
      structurallyValid: results.filter((result) => result.validSchema).length,
      validRate: mean(results.map((result) => (result.validSchema ? 1 : 0))),
      qualityMean: mean(reviewed.map(({ score }) => total(score))),
      qualityStdDev: stdDev(reviewed.map(({ score }) => total(score))),
      latencyMedianMs: percentile(durations, 0.5),
      latencyP95Ms: percentile(durations, 0.95),
      inputTokensMean: mean(reviewed.map(({ result }) => result.usage.inputTokens).filter(isNumber)),
      outputTokensMean: mean(reviewed.map(({ result }) => result.usage.outputTokens).filter(isNumber)),
      costMeanUsd: mean(reviewed.map(({ result }) => result.cost).filter(isNumber)),
      costTotalUsd: reviewed.map(({ result }) => result.cost).filter(isNumber).reduce((sum, cost) => sum + cost, 0),
      hallucinations: reviewed.reduce((sum, { score }) => sum + score.hallucinationCount, 0),
      criticalHallucinations: reviewed.filter(({ score }) => score.criticalHallucination).length,
      formatErrors: reviewed.filter(({ score }) => score.formatError).length,
    };
  });
  await writeFile(resolve(ROOT, 'results/aggregate.json'), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

function hasScore(value: { result: Raw; score: Reconciled['agreed'] | undefined }): value is { result: Raw; score: Reconciled['agreed'] } {
  return value.score !== undefined;
}
function total(score: Reconciled['agreed']): number {
  return score.accuracy + score.coverage + score.evidence + score.utility;
}
function isNumber(value: number | null): value is number {
  return value !== null;
}
function mean(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
}
function stdDev(values: number[]): number | null {
  const average = mean(values);
  if (average === null) return null;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length);
}
function percentile(values: number[], ratio: number): number | null {
  if (values.length === 0) return null;
  return values[Math.ceil(values.length * ratio) - 1] ?? null;
}

void main();
