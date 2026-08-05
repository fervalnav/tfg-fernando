import { Injectable } from '@nestjs/common';
import type { AiStructuredGenerationRequest, AiStructuredGenerationResult } from '../domain/ai-generation.service';
import { AiGenerationService } from '../domain/ai-generation.service';

const DETERMINISTIC_VALUES: Record<string, unknown> = {
  opportunity_summary: { result: 'Resumen determinista generado para pruebas E2E.' },
  control_question_answer: {
    answer: 'Cumple según la documentación de prueba.',
    evidence: 'Evidencia determinista E2E',
    passed: true,
  },
  custom_field_value: { value: 'Valor determinista E2E', evidence: 'Evidencia determinista E2E' },
  workflow_decision: { decision: true, evidence: 'Decisión determinista E2E' },
};

@Injectable()
export class FakeAiGenerationService extends AiGenerationService {
  generateStructured<T>(request: AiStructuredGenerationRequest<T>): Promise<AiStructuredGenerationResult<T>> {
    try {
      const value = request.schema.parse(DETERMINISTIC_VALUES[request.schemaName]);
      return Promise.resolve({
        value,
        provider: 'fake',
        model: 'deterministic-e2e',
        durationMs: 1,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      });
    } catch (error: unknown) {
      return Promise.reject(error instanceof Error ? error : new Error('Fake AI schema validation failed'));
    }
  }
}
