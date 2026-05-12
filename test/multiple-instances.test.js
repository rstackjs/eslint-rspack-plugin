import ESLintPlugin from '../src/index.js';

import pack from './utils/pack.js';

describe('multiple instances', () => {
  it("should don't fail", async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({ ignore: false, exclude: 'error.js' }),
          new ESLintPlugin({ ignore: false, exclude: 'error.js' }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should report errors from first instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            ignore: false,
            exclude: 'good.js',
            severity: { error: 'error' },
          }),
          new ESLintPlugin({
            ignore: false,
            exclude: 'error.js',
            severity: { error: 'error' },
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain('[eslint]');
  });

  it('should report errors from second instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            ignore: false,
            exclude: 'error.js',
            severity: { error: 'error' },
          }),
          new ESLintPlugin({
            ignore: false,
            exclude: 'good.js',
            severity: { error: 'error' },
          }),
        ],
      },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain('[eslint]');
  });
});
