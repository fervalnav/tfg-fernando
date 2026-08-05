import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGenerationService } from './domain/ai-generation.service';
import { GoogleVercelAiGenerationService } from './infrastructure/google-vercel-ai-generation.service';
import { OpenAiCompatibleVercelAiGenerationService } from './infrastructure/openai-compatible-vercel-ai-generation.service';
import { FakeAiGenerationService } from './infrastructure/fake-ai-generation.service';

@Module({
  providers: [
    GoogleVercelAiGenerationService,
    OpenAiCompatibleVercelAiGenerationService,
    FakeAiGenerationService,
    {
      provide: AiGenerationService,
      inject: [
        ConfigService,
        GoogleVercelAiGenerationService,
        OpenAiCompatibleVercelAiGenerationService,
        FakeAiGenerationService,
      ],
      useFactory: (
        config: ConfigService,
        google: GoogleVercelAiGenerationService,
        openAiCompatible: OpenAiCompatibleVercelAiGenerationService,
        fake: FakeAiGenerationService,
      ): AiGenerationService => {
        const provider = config.get<string>('AI_PROVIDER', 'ollama');
        if (provider === 'fake') {
          if (config.get<string>('NODE_ENV') === 'production') {
            throw new Error('The fake AI provider cannot be used in production');
          }
          return fake;
        }
        if (provider === 'google') return google;

        return openAiCompatible;
      },
    },
  ],
  exports: [AiGenerationService],
})
export class AiModule {}
