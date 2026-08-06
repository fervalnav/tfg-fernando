import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'happy-dom',
    include: ['app/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['app/**/*.{ts,vue}'],
      exclude: ['app/**/*.d.ts', 'app/**/*.spec.ts', 'app/**/index.ts', 'app/modules/shared/components/ui/**'],
      thresholds: {
        branches: 8,
        functions: 3,
        lines: 8,
        statements: 7,
      },
    },
  },
});
