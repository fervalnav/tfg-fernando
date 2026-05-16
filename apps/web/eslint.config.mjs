// @ts-check
import boundaries from 'eslint-plugin-boundaries';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Barrel-only imports: fuera de un módulo solo se puede importar desde su index.ts
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        // Cada carpeta bajo app/modules/ (excepto shared) es un módulo con barrel obligatorio
        {
          type: 'module',
          pattern: 'app/modules/!(shared)',
          capture: ['name'],
        },
        // Shared es libre de importar desde cualquier parte
        {
          type: 'shared',
          pattern: 'app/modules/shared/**',
        },
      ],
      // Las páginas y el entry point no pertenecen a ningún módulo
      'boundaries/ignore': ['app/pages/**', 'app/app.vue'],
    },
    rules: {
      // Solo se puede importar el index.ts de un módulo desde fuera de él.
      // Los componentes, composables y stores internos son privados al módulo.
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
);
