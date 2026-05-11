import { join } from 'path';

import pack from './utils/pack';

const eslintPath = join(__dirname, 'mock/eslint-recording');
const eslintMock = require('./mock/eslint-recording');

const ignoreOrder = () =>
  eslintMock.state.calls[0].sort((a1, a2) =>
    a1.length - a2.length > 0 ? -1 : 1,
  );

describe('eslint lint', () => {
  beforeEach(() => {
    eslintMock.reset();
  });

  it('should lint one file', async () => {
    const compiler = pack('lint-one', { eslintPath, threads: false });

    await compiler.runAsync();
    expect(eslintMock.state.calls).toHaveLength(1);
  });

  it('should lint two files', async () => {
    const compiler = pack('lint-two', { eslintPath, threads: false });

    await compiler.runAsync();
    const files = [
      expect.stringMatching('lint-two-entry.js'),
      expect.stringMatching('lint.js'),
    ];
    expect(ignoreOrder()).toEqual(files);
  });

  it('should lint more files', async () => {
    const compiler = pack('lint-more', { eslintPath, threads: false });

    await compiler.runAsync();
    const files = [
      expect.stringMatching('lint-more-entry.js'),
      expect.stringMatching('lint-more.js'),
      expect.stringMatching('lint.js'),
    ];

    expect(ignoreOrder()).toEqual(files);
  });
});
