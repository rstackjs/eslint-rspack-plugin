import { join } from 'path';

import * as eslintMock from './mock/eslint-recording/index.js';
import pack from './utils/pack.js';

const eslintPath = join(import.meta.dirname, 'mock/eslint-recording');

describe('error', () => {
  it('should return error if file is bad', async () => {
    const compiler = pack('error');

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it('should propagate eslint exceptions as errors', async () => {
    eslintMock.reset({ shouldReject: true });

    const compiler = pack('good', { eslintPath });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
