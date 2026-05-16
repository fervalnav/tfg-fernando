// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Barrel-only imports: fuera de un módulo solo se puede importar desde su index.ts
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        // Cada carpeta bajo src/ (excepto shared) es un módulo con barrel obligatorio
        {
          type: 'module',
          pattern: 'src/!(shared)',
          capture: ['name'],
        },
        // La infraestructura compartida es libre de importar
        {
          type: 'shared',
          pattern: 'src/shared/**',
        },
      ],
      // Ficheros raíz que no pertenecen a ningún módulo
      'boundaries/ignore': [
        'src/main.ts',
        'src/app.module.ts',
        'src/health.controller.ts',
      ],
    },
    rules: {
      // Solo se puede importar el index.ts de un módulo desde fuera de él.
      // Los ficheros internos (domain/, application/, infrastructure/) son privados.
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          rules: [
            {
              to: { type: 'module' },
              disallow: [{ to: { internalPath: '!(index.ts)' } }],
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
