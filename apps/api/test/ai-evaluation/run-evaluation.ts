import { readFile, mkdir, appendFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { z, type ZodType } from 'zod';
import { GoogleVercelAiGenerationService } from '../../src/ai/infrastructure/google-vercel-ai-generation.service';
import type { AiGenerationDocument, AiStructuredGenerationRequest } from '../../src/ai/domain/ai-generation.service';

type OperationName = 'summary' | 'control_question' | 'custom_field' | 'workflow_decision';
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type EvaluationCase = {
  id: string;
  title: string;
  documentPaths: string[];
  opportunity: { description: string; amount: number; currency: string; dueDate: string };
  operations: {
    summary: { instruction: string };
    controlQuestion: { question: string; answerType: string; passCondition: string };
    customField: {
      name: string;
      description: string;
      aiPrompt: string;
      type: string;
      classifiers: string[];
      canSelectMultiple: boolean;
    };
    workflowDecision: { condition: string };
  };
};
type EvaluationFile = { cases: EvaluationCase[] };
type RawResult = {
  runId: string;
  caseId: string;
  operation: OperationName;
  provider: string;
  model: string;
  repetition: number;
  startedAt: string;
  durationMs: number | null;
  usage: { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null };
  prices: { inputPerMillion: number; outputPerMillion: number; currency: 'USD'; source: string; date: string };
  cost: number | null;
  validSchema: boolean;
  output: JsonValue | null;
  error: string | null;
};

const MODELS = [
  { id: 'gemini-3-flash-preview', inputPerMillion: 0.5, outputPerMillion: 3 },
  { id: 'gemini-3.1-flash-lite', inputPerMillion: 0.25, outputPerMillion: 1.5 },
] as const;
const PRICE_SOURCE = 'https://ai.google.dev/gemini-api/docs/pricing';
const PRICE_DATE = '2026-08-13';
const REPETITIONS = 3;
const ROOT = resolve(__dirname);
const RESULTS_DIR = resolve(ROOT, 'results');
const RAW_PATH = resolve(RESULTS_DIR, 'raw-results.jsonl');
const CSV_PATH = resolve(RESULTS_DIR, 'results.csv');

const summarySchema = z.object({ result: z.string().trim().min(1) });
const controlSchema = z.object({
  answer: z.union([z.string().trim().min(1), z.boolean()]),
  evidence: z.string().trim().min(1),
  passed: z.boolean().nullable(),
});
const customFieldSchema = z.object({
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  evidence: z.string().trim().min(1),
});
const decisionSchema = z.object({ result: z.boolean(), evidence: z.string().trim().min(1) });

async function main(): Promise<void> {
  if (!process.env['GOOGLE_GENERATIVE_AI_API_KEY']) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is required');
  }
  await mkdir(RESULTS_DIR, { recursive: true });
  const evaluation = JSON.parse(await readFile(resolve(ROOT, 'evaluation-cases.json'), 'utf8')) as EvaluationFile;
  const completed = await completedRunIds();
  await ensureCsvHeader();

  for (const model of MODELS) {
    const service = new GoogleVercelAiGenerationService(
      new ConfigService({
        GOOGLE_GENERATIVE_AI_API_KEY: process.env['GOOGLE_GENERATIVE_AI_API_KEY'],
        AI_MODEL: model.id,
        AI_GOOGLE_THINKING_LEVEL: 'low',
        AI_MAX_OUTPUT_TOKENS: 2048,
        AI_MAX_RETRIES: 2,
      }),
    );
    for (const evaluationCase of evaluation.cases) {
      const documents = await loadDocuments(evaluationCase);
      for (const operation of operationNames()) {
        for (let repetition = 1; repetition <= REPETITIONS; repetition += 1) {
          const runId = `${evaluationCase.id}|${operation}|${model.id}|${repetition}`;
          if (completed.has(runId)) continue;
          const startedAt = new Date().toISOString();
          let raw: RawResult;
          try {
            const request = requestFor(evaluationCase, operation, documents);
            const generated = await service.generateStructured(request);
            const cost = calculateCost(generated.usage.inputTokens, generated.usage.outputTokens, model);
            raw = {
              runId,
              caseId: evaluationCase.id,
              operation,
              provider: generated.provider,
              model: generated.model,
              repetition,
              startedAt,
              durationMs: generated.durationMs,
              usage: generated.usage,
              prices: { ...model, currency: 'USD', source: PRICE_SOURCE, date: PRICE_DATE },
              cost,
              validSchema: true,
              output: generated.value as JsonValue,
              error: null,
            };
          } catch (error) {
            raw = {
              runId,
              caseId: evaluationCase.id,
              operation,
              provider: 'google',
              model: model.id,
              repetition,
              startedAt,
              durationMs: null,
              usage: { inputTokens: null, outputTokens: null, totalTokens: null },
              prices: { ...model, currency: 'USD', source: PRICE_SOURCE, date: PRICE_DATE },
              cost: null,
              validSchema: false,
              output: null,
              error: error instanceof Error ? error.message : 'Unknown generation error',
            };
          }
          await appendFile(RAW_PATH, `${JSON.stringify(raw)}\n`);
          await appendFile(CSV_PATH, `${csvRow(raw)}\n`);
          process.stdout.write(`${raw.runId} ${raw.error ? 'ERROR' : 'OK'}\n`);
        }
      }
    }
  }
}

function operationNames(): OperationName[] {
  return ['summary', 'control_question', 'custom_field', 'workflow_decision'];
}

async function loadDocuments(evaluationCase: EvaluationCase): Promise<AiGenerationDocument[]> {
  return Promise.all(
    evaluationCase.documentPaths.map(async (relativePath) => ({
      filename: relativePath.split('/').at(-1) ?? relativePath,
      mediaType: 'application/pdf',
      data: await readFile(resolve(ROOT, relativePath)),
    })),
  );
}

function requestFor(
  evaluationCase: EvaluationCase,
  operation: OperationName,
  documents: AiGenerationDocument[],
): AiStructuredGenerationRequest<JsonValue> {
  const common = [
    `Título: ${evaluationCase.title}`,
    `Descripción: ${evaluationCase.opportunity.description}`,
    `Importe: ${evaluationCase.opportunity.amount} ${evaluationCase.opportunity.currency}`,
    `Fecha límite: ${evaluationCase.opportunity.dueDate}`,
  ];
  if (operation === 'summary') {
    return request(
      summarySchema,
      'opportunity_summary',
      'Eres un analista comercial. Resume solo los datos proporcionados, no inventes información y responde en español. Incluye entre paréntesis las referencias de sección que sustentan los hechos principales.',
      [`Instrucción del resumen: ${evaluationCase.operations.summary.instruction}`, ...common],
      documents,
    );
  }
  if (operation === 'control_question') {
    const control = evaluationCase.operations.controlQuestion;
    return request(
      controlSchema,
      'control_question_answer',
      'Eres un analista comercial. Responde solo con datos disponibles, explica la evidencia con referencias de sección y no inventes información.',
      [
        `Pregunta: ${control.question}`,
        `Tipo de respuesta requerido: ${control.answerType}`,
        `Condición de aprobación: ${control.passCondition}`,
        ...common,
      ],
      documents,
    );
  }
  if (operation === 'custom_field') {
    const field = evaluationCase.operations.customField;
    return request(
      customFieldSchema,
      'custom_field_value',
      'Eres un analista comercial. Extrae el valor solicitado usando solo los datos disponibles, cita la sección en la evidencia y no inventes información.',
      [
        `Campo: ${field.name}`,
        `Descripción: ${field.description}`,
        `Instrucción: ${field.aiPrompt}`,
        `Tipo esperado: ${field.type}`,
        `Opciones permitidas: ${field.classifiers.join(', ') || 'No aplica'}`,
        `Selección múltiple: ${field.canSelectMultiple ? 'sí' : 'no'}`,
        ...common,
      ],
      documents,
    );
  }
  return request(
    decisionSchema,
    'workflow_decision',
    'Eres un analista comercial. Evalúa la condición únicamente con los datos proporcionados, no inventes información y justifica la decisión con referencias de sección.',
    [`Paso: Decisión de continuidad`, `Condición: ${evaluationCase.operations.workflowDecision.condition}`, ...common],
    documents,
  );
}

function request<T extends JsonValue>(
  schema: ZodType<T>,
  schemaName: string,
  system: string,
  promptLines: string[],
  documents: AiGenerationDocument[],
): AiStructuredGenerationRequest<JsonValue> {
  return { schema: schema as ZodType<JsonValue>, schemaName, system, prompt: promptLines.join('\n'), documents };
}

function calculateCost(
  inputTokens: number | null,
  outputTokens: number | null,
  model: (typeof MODELS)[number],
): number | null {
  if (inputTokens === null || outputTokens === null) return null;
  return (inputTokens * model.inputPerMillion + outputTokens * model.outputPerMillion) / 1_000_000;
}

async function completedRunIds(): Promise<Set<string>> {
  try {
    const content = await readFile(RAW_PATH, 'utf8');
    return new Set(
      content
        .split('\n')
        .filter(Boolean)
        .map((line) => (JSON.parse(line) as RawResult).runId),
    );
  } catch {
    return new Set();
  }
}

async function ensureCsvHeader(): Promise<void> {
  try {
    await readFile(CSV_PATH, 'utf8');
  } catch {
    await appendFile(
      CSV_PATH,
      'case_id,operation,provider,model,repetition,started_at,duration_ms,input_tokens,output_tokens,total_tokens,input_price_per_million,output_price_per_million,currency,price_source,price_date,cost,valid_schema,quality_accuracy_reviewer_1,quality_coverage_reviewer_1,quality_evidence_reviewer_1,quality_utility_reviewer_1,hallucination_count_reviewer_1,quality_accuracy_reviewer_2,quality_coverage_reviewer_2,quality_evidence_reviewer_2,quality_utility_reviewer_2,hallucination_count_reviewer_2,error\n',
    );
  }
}

function csvRow(raw: RawResult): string {
  const values: Array<string | number | boolean | null> = [
    raw.caseId,
    raw.operation,
    raw.provider,
    raw.model,
    raw.repetition,
    raw.startedAt,
    raw.durationMs,
    raw.usage.inputTokens,
    raw.usage.outputTokens,
    raw.usage.totalTokens,
    raw.prices.inputPerMillion,
    raw.prices.outputPerMillion,
    raw.prices.currency,
    raw.prices.source,
    raw.prices.date,
    raw.cost,
    raw.validSchema,
    '', '', '', '', '', '', '', '', '', '',
    raw.error,
  ];
  return values.map(csv).join(',');
}

function csv(value: string | number | boolean | null): string {
  if (value === null) return '';
  const text = String(value);
  return /[",\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
