// Configuration guide: https://rstack.rs/config
import { define } from 'rstack';

define.lib({
  lib: [
    {
      syntax: 'es2023',
      dts: true,
    },
  ],
});

define.test({
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60000,
  output: {
    bundleDependencies: ['arrify', 'fs-extra'],
  },
});

define.fmt({
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  ignorePatterns: [
    'coverage/**',
    'dist/**',
    'node_modules/**',
    'test/fixtures/**',
    'test/output/**',
    'CHANGELOG.md',
  ],
});

define.staged({
  '*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}': ['rs lint', 'rs fmt'],
  '*.{json,md,mdx,css,scss,less,html,yml,yaml}': 'rs fmt',
});

define.lint(({ globals, js }) => [
  {
    ignores: [
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'test/fixtures/**',
      'test/output/**',
      'types/**/*',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
    rules: {
      'global-require': 'off',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      strict: 'error',
    },
  },
]);
