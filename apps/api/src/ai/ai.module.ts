import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGenerationService } from './domain/ai-generation.service';
import { GoogleVercelAiGenerationService } from './infrastructure/google-vercel-ai-generation.service';
import { OpenAiCompatibleVercelAiGenerationService } from './infrastructure/openai-compatible-vercel-ai-generation.service';

@Module({
  providers: [
    GoogleVercelAiGenerationService,
    OpenAiCompatibleVercelAiGenerationService,
    {
      provide: AiGenerationService,
      inject: [ConfigService, GoogleVercelAiGenerationService, OpenAiCompatibleVercelAiGenerationService],
      useFactory: (
        config: ConfigService,
        google: GoogleVercelAiGenerationService,
        openAiCompatible: OpenAiCompatibleVercelAiGenerationService,
      ): AiGenerationService => {
        if (config.get<string>('AI_PROVIDER', 'ollama') === 'google') return google;

        return openAiCompatible;
      },
    },
  ],
  exports: [AiGenerationService],
})
export class AiModule {}
