import { defineConfig } from '@rstest/core';

export default defineConfig({
  globals: true,
  testEnvironment: 'node',
  testTimeout: 60000,
  output: {
    bundleDependencies: ['arrify', 'fs-extra'],
  },
});
