import { join } from 'path';

import pack from './utils/pack.js';

const eslintPath = join(import.meta.dirname, 'mock/eslint-rejecting');

describe('error', () => {
  it('should return error if file is bad', async () => {
    const compiler = pack('error');

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it('should propagate eslint exceptions as errors', async () => {
    const compiler = pack('good', { eslintPath });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
