import { defineConfig, devices } from '@playwright/test';

const WEB_URL = 'http://127.0.0.1:3002';
const API_URL = 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 2 : 0,
  reporter: process.env['CI'] ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: WEB_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --dir ../api test:e2e:browser:serve',
      url: `${API_URL}/api/health`,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        PORT: '3100',
        E2E_DATABASE_NAME: 'tfg_browser_e2e',
        CORS_ORIGIN: WEB_URL,
        FRONTEND_URL: WEB_URL,
        AI_PROVIDER: 'fake',
        S3_BUCKET: 'tfg-browser-e2e',
      },
    },
    {
      command: 'pnpm exec nuxt dev --host 127.0.0.1 --port 3002',
      url: WEB_URL,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        NUXT_PUBLIC_API_URL: API_URL,
      },
    },
  ],
});
