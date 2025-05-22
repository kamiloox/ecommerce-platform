const pluginNext = require('@next/eslint-plugin-next');
const reactConfig = require('./react-internal.js');

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
const nextJsConfig = [
  ...reactConfig,
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
];

module.exports = nextJsConfig;
