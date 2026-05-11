import pack from './utils/pack';

const ignoreOrder = (mockLintFiles) =>
  mockLintFiles.mock.calls[0][0].sort((a1, a2) =>
    a1.length - a2.length > 0 ? -1 : 1,
  );

describe('eslint lint', () => {
  const mockLintFiles = jest.fn().mockReturnValue([]);

  beforeAll(() => {
    jest.mock('eslint', () => {
      return {
        loadESLint: async () =>
          function ESLint() {
            this.lintFiles = mockLintFiles;
          },
      };
    });
  });

  beforeEach(() => {
    mockLintFiles.mockClear();
  });

  it('should lint one file', async () => {
    const compiler = pack('lint-one', { threads: false });

    await compiler.runAsync();
    expect(mockLintFiles).toHaveBeenCalledTimes(1);
  });

  it('should lint two files', async () => {
    const compiler = pack('lint-two', { threads: false });

    await compiler.runAsync();
    const files = [
      expect.stringMatching('lint-two-entry.js'),
      expect.stringMatching('lint.js'),
    ];
    expect(ignoreOrder(mockLintFiles)).toEqual(files);
  });

  it('should lint more files', async () => {
    const compiler = pack('lint-more', { threads: false });

    await compiler.runAsync();
    const files = [
      expect.stringMatching('lint-more-entry.js'),
      expect.stringMatching('lint-more.js'),
      expect.stringMatching('lint.js'),
    ];

    expect(ignoreOrder(mockLintFiles)).toEqual(files);
  });
});
