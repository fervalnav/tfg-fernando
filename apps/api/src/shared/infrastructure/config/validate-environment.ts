import { z } from 'zod';

const baseEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    S3_PRESIGNED_URL_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(3600),
  })
  .passthrough();

const productionEnvironmentSchema = z
  .object({
    JWT_SECRET: z.string().min(32),
    REFRESH_TOKEN_SECRET: z.string().min(32),
    DATABASE_HOST: z.string().min(1),
    DATABASE_PORT: z.coerce.number().int().min(1).max(65_535),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(16),
    DATABASE_NAME: z.string().min(1),
    CORS_ORIGIN: z.string().url().startsWith('https://'),
    FRONTEND_URL: z.string().url().startsWith('https://'),
    AI_PROVIDER: z.enum(['google', 'ollama']),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    AI_BASE_URL: z.string().url().optional(),
    S3_ENDPOINT: z.string().url(),
    S3_PUBLIC_ENDPOINT: z.string().url().startsWith('https://'),
    S3_ACCESS_KEY_ID: z.string().min(3),
    S3_SECRET_ACCESS_KEY: z.string().min(8),
    S3_BUCKET: z.string().min(3),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_FROM: z.string().email(),
  })
  .passthrough()
  .superRefine((environment, context) => {
    if (environment.AI_PROVIDER === 'google' && !environment.GOOGLE_GENERATIVE_AI_API_KEY) {
      context.addIssue({
        code: 'custom',
        path: ['GOOGLE_GENERATIVE_AI_API_KEY'],
        message: 'GOOGLE_GENERATIVE_AI_API_KEY is required when AI_PROVIDER=google',
      });
    }

    if (environment.AI_PROVIDER === 'ollama' && !environment.AI_BASE_URL) {
      context.addIssue({
        code: 'custom',
        path: ['AI_BASE_URL'],
        message: 'AI_BASE_URL is required when AI_PROVIDER=ollama',
      });
    }

    if (Boolean(environment.SMTP_USER) !== Boolean(environment.SMTP_PASSWORD)) {
      context.addIssue({
        code: 'custom',
        path: ['SMTP_PASSWORD'],
        message: 'SMTP_USER and SMTP_PASSWORD must be configured together',
      });
    }
  });

export function validateEnvironment(values: Record<string, unknown>): Record<string, unknown> {
  const environment = baseEnvironmentSchema.parse(values);
  if (environment.NODE_ENV !== 'production') return environment;

  return productionEnvironmentSchema.parse(environment);
}
