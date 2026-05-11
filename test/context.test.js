import { join } from 'path';

import pack from './utils/pack.js';

describe('context', () => {
  it('absolute', async () => {
    const compiler = pack('good', {
      context: join(import.meta.dirname, 'fixtures'),
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('relative', async () => {
    const compiler = pack('good', { context: '../fixtures/' });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
