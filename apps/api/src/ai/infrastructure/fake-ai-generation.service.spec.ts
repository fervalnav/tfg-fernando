import { z } from 'zod';
import { FakeAiGenerationService } from './fake-ai-generation.service';

describe('FakeAiGenerationService', () => {
  it('returns deterministic values validated by the requested schema', async () => {
    const service = new FakeAiGenerationService();

    await expect(
      service.generateStructured({
        schema: z.object({ result: z.string().min(1) }),
        schemaName: 'opportunity_summary',
        system: 'system',
        prompt: 'prompt',
        documents: [{ filename: 'fixture.pdf', mediaType: 'application/pdf', data: Buffer.from('%PDF') }],
      }),
    ).resolves.toEqual({
      value: { result: 'Resumen determinista generado para pruebas E2E.' },
      provider: 'fake',
      model: 'deterministic-e2e',
      durationMs: 1,
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    });
  });

  it('rejects an unsupported schema instead of returning invalid data', async () => {
    const service = new FakeAiGenerationService();

    await expect(
      service.generateStructured({
        schema: z.object({ unsupported: z.string() }),
        schemaName: 'unsupported',
        system: 'system',
        prompt: 'prompt',
      }),
    ).rejects.toThrow();
  });
});
