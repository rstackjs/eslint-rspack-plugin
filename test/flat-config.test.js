import { join } from 'path';

import pack from './utils/pack';

describe('succeed on flat-configuration', () => {
  it('uses flat config by default', async () => {
    const overrideConfigFile = join(__dirname, 'fixtures', 'flat-config.js');
    const compiler = pack('full-of-problems', {
      overrideConfigFile,
      threads: 1,
    });

    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;

    expect(stats.hasErrors()).toBe(true);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/full-of-problems\.js/i);
    expect(stats.hasWarnings()).toBe(true);
  });

  it('finds errors on files with explicit flat config type', async () => {
    const overrideConfigFile = join(__dirname, 'fixtures', 'flat-config.js');
    const compiler = pack('full-of-problems', {
      configType: 'flat',
      overrideConfigFile,
      threads: 1,
    });

    const stats = await compiler.runAsync();
    const { errors } = stats.compilation;

    expect(stats.hasErrors()).toBe(true);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/full-of-problems\.js/i);
    expect(stats.hasWarnings()).toBe(true);
  });
});
