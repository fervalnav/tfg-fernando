import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, Output } from 'ai';
import {
  AiGenerationService,
  type AiStructuredGenerationRequest,
  type AiStructuredGenerationResult,
} from '../domain/ai-generation.service';

@Injectable()
export class OpenAiCompatibleVercelAiGenerationService extends AiGenerationService {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async generateStructured<T>(request: AiStructuredGenerationRequest<T>): Promise<AiStructuredGenerationResult<T>> {
    const providerName = this.config.get<string>('AI_PROVIDER', 'ollama');
    const modelName = this.config.get<string>('AI_MODEL', 'qwen3:8b');
    const provider = createOpenAICompatible({
      name: providerName,
      baseURL: this.config.get<string>('AI_BASE_URL', 'http://localhost:11434/v1'),
      apiKey: this.config.get<string>('AI_API_KEY') || undefined,
      supportsStructuredOutputs: this.config.get<string>('AI_STRUCTURED_OUTPUTS', 'true') !== 'false',
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
      maxOutputTokens: request.maxOutputTokens ?? this.config.get<number>('AI_MAX_OUTPUT_TOKENS', 800),
      maxRetries: this.config.get<number>('AI_MAX_RETRIES', 2),
      temperature: 0,
    });

    return {
      value: result.output,
      provider: providerName,
      model: modelName,
      durationMs: Math.round(performance.now() - startedAt),
      usage: {
        inputTokens: result.usage.inputTokens ?? null,
        outputTokens: result.usage.outputTokens ?? null,
        totalTokens: result.usage.totalTokens ?? null,
      },
    };
  }
}
