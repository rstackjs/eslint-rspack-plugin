import { join } from 'path';

import pack from './utils/pack';

describe('fail on config', () => {
  it('fails the build when .eslintrc is not a proper format', async () => {
    const overrideConfigFile = join(__dirname, '.badeslintrc');
    const compiler = pack('error', { overrideConfigFile });

    await expect(compiler.runAsync()).rejects.toThrow();
  });
});
