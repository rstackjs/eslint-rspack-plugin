import pack from './utils/pack';

describe('lint all files', () => {
  it('should only lint files in compilation when lintAllFiles is false', async () => {
    const compiler = pack('lint-all-files', {
      lintAllFiles: false,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-included.js'),
    );
    expect(message).not.toEqual(
      expect.stringMatching('lint-all-files-not-included.js'),
    );
  });

  it('should lint all matching files when lintAllFiles is true', async () => {
    const compiler = pack('lint-all-files', {
      lintAllFiles: true,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-included.js'),
    );
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-not-included.js'),
    );
  });

  it('should respect files option with lintAllFiles', async () => {
    const compiler = pack('lint-all-files', {
      lintAllFiles: true,
      files: 'lint-all-files-included.js',
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-included.js'),
    );
    expect(message).not.toEqual(
      expect.stringMatching('lint-all-files-not-included.js'),
    );
  });

  it('should respect exclude option with lintAllFiles', async () => {
    const compiler = pack('lint-all-files', {
      lintAllFiles: true,
      exclude: ['**/lint-all-files-not-included.js'],
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-included.js'),
    );
    expect(message).not.toEqual(
      expect.stringMatching('lint-all-files-not-included.js'),
    );
  });

  it('should respect extensions option with lintAllFiles', async () => {
    const compiler = pack('lint-all-files', {
      lintAllFiles: true,
      extensions: ['jsx'],
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });

  it('should work with lintDirtyModulesOnly disabled (default)', async () => {
    const compiler = pack('lint-all-files', {
      lintAllFiles: true,
      lintDirtyModulesOnly: false,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-included.js'),
    );
    expect(message).toEqual(
      expect.stringMatching('lint-all-files-not-included.js'),
    );
  });
});
