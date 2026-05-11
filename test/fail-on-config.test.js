import { join } from 'path';

import pack from './utils/pack';

describe('fail on config', () => {
  it('fails the build when ESLint config is not a proper format', async () => {
    const overrideConfigFile = join(__dirname, 'bad-eslint.config.mjs');
    const compiler = pack('error', { overrideConfigFile });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });
});
