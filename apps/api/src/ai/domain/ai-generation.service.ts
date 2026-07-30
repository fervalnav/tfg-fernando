import type { ZodType } from 'zod';

export type AiGenerationUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
};

export type AiStructuredGenerationRequest<T> = {
  schema: ZodType<T>;
  schemaName: string;
  system: string;
  prompt: string;
  documents?: AiGenerationDocument[];
  maxOutputTokens?: number;
};

export type AiGenerationDocument = {
  filename: string;
  mediaType: string;
  data: Uint8Array;
};

export type AiStructuredGenerationResult<T> = {
  value: T;
  provider: string;
  model: string;
  durationMs: number;
  usage: AiGenerationUsage;
};

export abstract class AiGenerationService {
  abstract generateStructured<T>(request: AiStructuredGenerationRequest<T>): Promise<AiStructuredGenerationResult<T>>;
}
