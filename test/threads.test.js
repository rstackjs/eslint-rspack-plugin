import { join } from 'path';

import { loadESLint, loadESLintThreaded } from '../src/getESLint';

const eslintPath = join(__dirname, 'mock/eslint-recording');
const eslintMock = require('./mock/eslint-recording');

describe('Threading', () => {
  test('Threaded interface should look like non-threaded interface', async () => {
    const options = { overrideConfigFile: true };
    const single = await loadESLint(options);
    const threaded = await loadESLintThreaded('foo', 1, options);
    for (const key of Object.keys(single)) {
      expect(typeof single[key]).toEqual(typeof threaded[key]);
    }

    expect(single.Eslint).toBe(threaded.Eslint);
    expect(single.eslint).not.toBe(threaded.eslint);
    expect(single.lintFiles).not.toBe(threaded.lintFiles);
    expect(single.cleanup).not.toBe(threaded.cleanup);

    single.cleanup();
    threaded.cleanup();
  });

  test('Threaded should lint files', async () => {
    const overrideConfigFile = join(
      __dirname,
      'config-for-tests',
      'eslint.config.mjs',
    );
    const threaded = await loadESLintThreaded('bar', 1, {
      ignore: false,
      overrideConfigFile,
    });
    try {
      const [good, bad] = await Promise.all([
        threaded.lintFiles(join(__dirname, 'fixtures/good.js')),
        threaded.lintFiles(join(__dirname, 'fixtures/error.js')),
      ]);
      expect(good[0].errorCount).toBe(0);
      expect(good[0].warningCount).toBe(0);
      expect(bad[0].errorCount).toBe(3);
      expect(bad[0].warningCount).toBe(0);
    } finally {
      threaded.cleanup();
    }
  });

  describe('worker coverage', () => {
    beforeEach(() => {
      eslintMock.reset();
    });

    test('worker can start', async () => {
      const { setup, lintFiles } = require('../src/worker');

      await setup({ eslintPath });
      await lintFiles('foo');
      expect(eslintMock.state.calls).toContain('foo');

      await setup({ eslintPath, eslintOptions: { fix: true } });
      await lintFiles('foo');
      expect(eslintMock.state.outputFixesCalls).toHaveLength(1);
    });
  });
});
