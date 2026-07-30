import { ConfigService } from '@nestjs/config';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { GoogleVercelAiGenerationService } from './google-vercel-ai-generation.service';

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(),
}));

jest.mock('ai', () => ({
  generateText: jest.fn(),
  Output: {
    object: jest.fn((options: unknown) => options),
  },
}));

describe('GoogleVercelAiGenerationService', () => {
  const providerModel = { specificationVersion: 'v3' };
  const provider = jest.fn(() => providerModel);

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(createGoogleGenerativeAI)
      .mockReturnValue(provider as unknown as ReturnType<typeof createGoogleGenerativeAI>);
  });

  it('sends PDF buffers through the native Google provider', async () => {
    const config = new ConfigService({
      AI_MODEL: 'gemini-3.1-flash-lite',
      GOOGLE_GENERATIVE_AI_API_KEY: 'test-key',
      AI_MAX_OUTPUT_TOKENS: 1200,
      AI_MAX_RETRIES: 1,
      AI_GOOGLE_THINKING_LEVEL: 'minimal',
    });
    const document = {
      filename: 'pliego.pdf',
      mediaType: 'application/pdf',
      data: new Uint8Array([37, 80, 68, 70]),
    };
    const schema = z.object({ answer: z.string() });
    const output = { answer: 'Cumple' };
    jest.mocked(generateText).mockResolvedValue({
      output,
      usage: {
        inputTokens: 12,
        outputTokens: 3,
        totalTokens: 15,
      },
    } as Awaited<ReturnType<typeof generateText>>);

    const result = await new GoogleVercelAiGenerationService(config).generateStructured({
      schema,
      schemaName: 'qualification',
      system: 'Analiza la licitación',
      prompt: 'Comprueba el requisito',
      documents: [document],
    });

    expect(createGoogleGenerativeAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(provider).toHaveBeenCalledWith('gemini-3.1-flash-lite');
    expect(Output.object).toHaveBeenCalledWith({
      schema,
      name: 'qualification',
    });
    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: providerModel,
        system: 'Analiza la licitación',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Comprueba el requisito' },
              {
                type: 'file',
                data: document.data,
                mediaType: 'application/pdf',
                filename: 'pliego.pdf',
              },
            ],
          },
        ],
        maxOutputTokens: 1200,
        maxRetries: 1,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingLevel: 'minimal',
            },
          },
        },
      }),
    );
    expect(result).toMatchObject({
      value: output,
      provider: 'google',
      model: 'gemini-3.1-flash-lite',
      usage: {
        inputTokens: 12,
        outputTokens: 3,
        totalTokens: 15,
      },
    });
    expect(typeof result.durationMs).toBe('number');
  });

  it('falls back to low thinking for an unsupported configured value', async () => {
    const config = new ConfigService({
      AI_MODEL: 'gemini-3.1-flash-lite',
      GOOGLE_GENERATIVE_AI_API_KEY: 'test-key',
      AI_GOOGLE_THINKING_LEVEL: 'unsupported',
    });
    jest.mocked(generateText).mockResolvedValue({
      output: { answer: 'Cumple' },
      usage: {},
    } as Awaited<ReturnType<typeof generateText>>);

    await new GoogleVercelAiGenerationService(config).generateStructured({
      schema: z.object({ answer: z.string() }),
      schemaName: 'qualification',
      system: 'Analiza',
      prompt: 'Responde',
    });

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: 4096,
        providerOptions: {
          google: {
            thinkingConfig: {
              thinkingLevel: 'low',
            },
          },
        },
      }),
    );
  });
});
