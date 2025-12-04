import { join } from 'path';

import ESLintPlugin from '../../src';

export default (entry, pluginConf = {}, webpackConf = {}) => {
  const testDir = join(__dirname, '..');

  /**
   * Entry supports two formats:
   * - Simple: 'error' -> './error-entry.js' in 'fixtures/'
   * - Subdirectory: 'lint-all-files/entry' -> './entry.js' in 'fixtures/lint-all-files/'
   */
  const [dirOrEntry, file] = entry.split('/');
  const entryFile = file ? `./${file}.js` : `./${dirOrEntry}-entry.js`;
  const contextPath = join(testDir, 'fixtures', file ? dirOrEntry : '');

  return {
    entry: entryFile,
    context: contextPath,
    mode: 'development',
    output: {
      path: join(testDir, 'output'),
    },
    plugins: [
      new ESLintPlugin({
        // this disables the use of .eslintignore, since it contains the fixtures
        // folder to skip it on the global linting, but here we want the opposite
        // (we only use .eslintignore on the test that checks this)
        ignore: false,
        // TODO: update tests to run both states: test.each([[{threads: false}], [{threads: true}]])('it should...', async ({threads}) => {...})
        threads: true,
        ...pluginConf,
      }),
    ],
    ...webpackConf,
  };
};
