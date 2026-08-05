import type {
  AiStructuredGenerationRequest,
  AiStructuredGenerationResult,
} from '../../src/ai/domain/ai-generation.service';
import { AiGenerationService } from '../../src/ai/domain/ai-generation.service';

const VALUES_BY_SCHEMA: Record<string, unknown> = {
  opportunity_summary: { result: 'Resumen determinista generado en E2E.' },
  control_question_answer: {
    answer: 'Cumple según la documentación aportada.',
    evidence: 'Evidencia E2E',
    passed: true,
  },
  custom_field_value: { value: 'Valor E2E', evidence: 'Evidencia E2E' },
  workflow_decision: { decision: true, evidence: 'Decisión E2E determinista' },
};

export class FakeAiGenerationService extends AiGenerationService {
  readonly requests: AiStructuredGenerationRequest<unknown>[] = [];

  async generateStructured<T>(request: AiStructuredGenerationRequest<T>): Promise<AiStructuredGenerationResult<T>> {
    this.requests.push(request as AiStructuredGenerationRequest<unknown>);
    const value = request.schema.parse(VALUES_BY_SCHEMA[request.schemaName]);
    return {
      value,
      provider: 'fake',
      model: 'deterministic-e2e',
      durationMs: 1,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    };
  }

  reset(): void {
    this.requests.length = 0;
  }
}
