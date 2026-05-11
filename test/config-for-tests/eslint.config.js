import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig({
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  rules: {
    'no-console': 'warn',
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
});
