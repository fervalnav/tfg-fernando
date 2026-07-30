import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createGoogleGenerativeAI, type GoogleGenerativeAIProviderOptions } from '@ai-sdk/google';
import { generateText, Output } from 'ai';
import {
  AiGenerationService,
  type AiStructuredGenerationRequest,
  type AiStructuredGenerationResult,
} from '../domain/ai-generation.service';

@Injectable()
export class GoogleVercelAiGenerationService extends AiGenerationService {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async generateStructured<T>(request: AiStructuredGenerationRequest<T>): Promise<AiStructuredGenerationResult<T>> {
    const modelName = this.config.get<string>('AI_MODEL', 'gemini-3.1-flash-lite');
    const provider = createGoogleGenerativeAI({
      apiKey: this.config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY'),
    });
    const startedAt = performance.now();
    const result = await generateText({
      model: provider(modelName),
      output: Output.object({
        schema: request.schema,
        name: request.schemaName,
      }),
      system: request.system,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: request.prompt },
            ...(request.documents ?? []).map((document) => ({
              type: 'file' as const,
              data: document.data,
              mediaType: document.mediaType,
              filename: document.filename,
            })),
          ],
        },
      ],
      maxOutputTokens: request.maxOutputTokens ?? this.config.get<number>('AI_MAX_OUTPUT_TOKENS', 4096),
      maxRetries: this.config.get<number>('AI_MAX_RETRIES', 2),
      providerOptions: {
        google: {
          thinkingConfig: {
            thinkingLevel: this.getThinkingLevel(),
          },
        } satisfies GoogleGenerativeAIProviderOptions,
      },
    });

    return {
      value: result.output,
      provider: 'google',
      model: modelName,
      durationMs: Math.round(performance.now() - startedAt),
      usage: {
        inputTokens: result.usage.inputTokens ?? null,
        outputTokens: result.usage.outputTokens ?? null,
        totalTokens: result.usage.totalTokens ?? null,
      },
    };
  }

  private getThinkingLevel(): 'minimal' | 'low' | 'medium' | 'high' {
    const configured = this.config.get<string>('AI_GOOGLE_THINKING_LEVEL', 'low');
    if (configured === 'minimal' || configured === 'medium' || configured === 'high') return configured;

    return 'low';
  }
}
