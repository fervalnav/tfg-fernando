export default {
  'apps/api/src/**/*.ts': [
    'prettier --write',
    (files) =>
      `./apps/api/node_modules/.bin/eslint --fix --config apps/api/eslint.config.mjs ${files.join(' ')}`,
  ],
  'apps/web/app/**/*.{ts,vue}': [
    'prettier --write',
    (files) =>
      `./apps/web/node_modules/.bin/eslint --fix --config apps/web/eslint.config.mjs ${files.join(' ')}`,
  ],
};
