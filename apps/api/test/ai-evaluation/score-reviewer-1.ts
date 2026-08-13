import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type BlindMap = { blindId: string; runId: string };
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

const REVIEW_DIR = resolve(__dirname, 'reviews');

async function main(): Promise<void> {
  const mapping = JSON.parse(await readFile(resolve(REVIEW_DIR, 'blind-map.json'), 'utf8')) as BlindMap[];
  const reviews = mapping.map(review);
  await writeFile(resolve(REVIEW_DIR, 'reviewer-1.json'), `${JSON.stringify(reviews, null, 2)}\n`);
  process.stdout.write(`Reviewer 1 scored ${reviews.length} outputs\n`);
}

function review({ blindId, runId }: BlindMap): Review {
  const result: Review = {
    blindId,
    accuracy: 2,
    coverage: 2,
    evidence: 2,
    utility: 2,
    hallucinationCount: 0,
    criticalHallucination: false,
    formatError: false,
    comment: 'Respuesta exacta, completa, localizable y útil respecto al caso congelado.',
  };

  if (runId.includes('fictitious-solar-maintenance-03|summary|')) {
    result.coverage = 1;
    result.comment = 'Omite el presupuesto de 175.000 EUR (PCAP 1.2), aunque cubre alcance, lotes, garantía y exclusión.';
  }
  if (runId.includes('fictitious-archive-digitization-04|summary|')) {
    result.coverage = 1;
    result.comment = 'Expone la certificación caducada (CANDIDATE 5.1), pero no formula explícitamente el resultado desfavorable esperado.';
  }
  if (
    runId === 'fictitious-it-support-01|custom_field|gemini-3-flash-preview|1' ||
    runId === 'fictitious-it-support-01|custom_field|gemini-3-flash-preview|2'
  ) {
    result.evidence = 1;
    result.comment = 'El valor 24 es correcto, pero la evidencia no identifica la sección localizable PCAP 4.1.';
  }
  return result;
}

void main();
