import ESLintError from '../src/ESLintError';

import pack from './utils/pack';

describe('ignore patterns', () => {
  it('should ignore files matching ignore patterns', async () => {
    const compiler = pack('ignore', {
      ignore: true,
      overrideConfig: {
        ignores: ['**/ignore.js'],
      },
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(
      stats.compilation.errors.filter((x) => x instanceof ESLintError),
    ).toEqual([]);
  });
});
