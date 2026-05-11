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

  it('should fail on first instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            ignore: false,
            exclude: 'good.js',
            failOnError: true,
          }),
          new ESLintPlugin({
            ignore: false,
            exclude: 'error.js',
            failOnError: true,
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow();
  });

  it('should fail on second instance', async () => {
    const compiler = pack(
      'multiple',
      {},
      {
        plugins: [
          new ESLintPlugin({
            ignore: false,
            exclude: 'error.js',
            failOnError: true,
          }),
          new ESLintPlugin({
            ignore: false,
            exclude: 'good.js',
            failOnError: true,
          }),
        ],
      },
    );

    await expect(compiler.runAsync()).rejects.toThrow();
  });
});
