import { join } from 'path';
import { pathToFileURL } from 'url';

import { getESLint } from '../src/getESLint.js';
import pack from './utils/pack.js';

describe('eslint path', () => {
  it('should use another instance of eslint via eslintPath config', async () => {
    const eslintPath = join(import.meta.dirname, 'mock/eslint');
    const compiler = pack('good', { eslintPath });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain('Fake error');
  });

  it('should use eslint from an absolute file path', async () => {
    const eslintPath = join(import.meta.dirname, 'mock/eslint/index.js');

    const { eslint } = await getESLint({
      eslintPath,
      configType: 'flat',
    });

    expect(eslint).toBeTruthy();
  });

  it('should fail with a clear error when eslintPath does not export loadESLint', async () => {
    const eslintPath = join(import.meta.dirname, 'mock/eslint-no-load');

    await expect(
      getESLint({
        eslintPath,
        configType: 'flat',
      }),
    ).rejects.toThrow(
      'eslint-rspack-plugin requires ESLint 9 or later. Make sure eslintPath resolves to an ESLint 9+ module that exports loadESLint().',
    );
  });

  it('should preserve eslintPath module evaluation errors', async () => {
    const eslintPath = `${
      pathToFileURL(
        join(import.meta.dirname, 'mock/eslint-import-error/index.js'),
      ).href
    }?runtime-error`;

    await expect(
      getESLint({
        eslintPath,
        configType: 'flat',
      }),
    ).rejects.toThrow('ESLint import failed during evaluation.');
  });

  it('should report eslintPath setup failures as compilation errors', async () => {
    const eslintPath = join(import.meta.dirname, 'mock/eslint-no-load');
    const compiler = pack('good', { eslintPath });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain(
      'eslint-rspack-plugin requires ESLint 9 or later.',
    );
  });
});
