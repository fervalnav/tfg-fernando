import { validateEnvironment } from './validate-environment';

describe('validateEnvironment', () => {
  it('keeps development defaults without requiring production secrets', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual(
      expect.objectContaining({ NODE_ENV: 'development', PORT: 3000 }),
    );
  });

  it('rejects placeholder production secrets and insecure public URLs', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'production',
        JWT_SECRET: 'short',
        REFRESH_TOKEN_SECRET: 'short',
      }),
    ).toThrow();
  });

  it('requires the API key selected by the production AI provider', () => {
    expect(() => validateEnvironment(productionEnvironment())).toThrow('GOOGLE_GENERATIVE_AI_API_KEY is required');
  });

  it('accepts a complete production environment', () => {
    expect(
      validateEnvironment(productionEnvironment({ GOOGLE_GENERATIVE_AI_API_KEY: 'google-production-key' })),
    ).toEqual(expect.objectContaining({ NODE_ENV: 'production', AI_PROVIDER: 'google' }));
  });
});

function productionEnvironment(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    NODE_ENV: 'production',
    JWT_SECRET: 'jwt-secret-with-at-least-thirty-two-characters',
    REFRESH_TOKEN_SECRET: 'refresh-secret-with-at-least-thirty-two-characters',
    DATABASE_HOST: 'postgres',
    DATABASE_PORT: 5432,
    DATABASE_USER: 'lia',
    DATABASE_PASSWORD: 'database-password',
    DATABASE_NAME: 'lia',
    CORS_ORIGIN: 'https://lia.example.test',
    FRONTEND_URL: 'https://lia.example.test',
    AI_PROVIDER: 'google',
    S3_ENDPOINT: 'http://minio:9000',
    S3_PUBLIC_ENDPOINT: 'https://files.lia.example.test',
    S3_ACCESS_KEY_ID: 'lia',
    S3_SECRET_ACCESS_KEY: 'storage-password',
    S3_BUCKET: 'lia-files',
    SMTP_HOST: 'smtp.example.test',
    SMTP_PORT: 587,
    SMTP_FROM: 'no-reply@example.test',
    ...overrides,
  };
}
