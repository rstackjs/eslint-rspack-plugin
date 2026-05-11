import { join } from 'path';

import pack from './utils/pack.js';

describe('fail on config', () => {
  it('fails the build when ESLint config is not a proper format', async () => {
    const overrideConfigFile = join(
      import.meta.dirname,
      'bad-eslint.config.js',
    );
    const compiler = pack('error', { overrideConfigFile });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });
});
