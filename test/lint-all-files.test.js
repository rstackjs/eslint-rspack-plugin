import pack from './utils/pack';

describe('lint all files', () => {
  it('should only lint files in compilation when lintAllFiles is false', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: false,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).not.toEqual(expect.stringMatching('not-included.js'));
  });

  it('should lint all matching files when lintAllFiles is true', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).toEqual(expect.stringMatching('not-included.js'));
  });

  it('should respect files option with lintAllFiles', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
      files: 'included.js',
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).not.toEqual(expect.stringMatching('not-included.js'));
  });

  it('should respect exclude option with lintAllFiles', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
      exclude: ['**/not-included.js'],
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).not.toEqual(expect.stringMatching('not-included.js'));
  });

  it('should respect extensions option with lintAllFiles', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
      extensions: ['jsx'],
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });

  it('should lint nested directories recursively', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    // Should include files from root
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).toEqual(expect.stringMatching('not-included.js'));
    // Should also include files from nested directories
    expect(message).toEqual(expect.stringMatching('nested/deep.js'));
  });

  it('should exclude nested directories when specified', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
      exclude: ['**/nested/**'],
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    // Should include root files
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).toEqual(expect.stringMatching('not-included.js'));
    // Should NOT include nested files
    expect(message).not.toEqual(expect.stringMatching('nested/deep.js'));
  });

  it('should handle when no files match the pattern', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
      files: '*.jsx',
    });

    const stats = await compiler.runAsync();
    // Should complete successfully with no errors since no .jsx files exist
    expect(stats.hasErrors()).toBe(false);
  });

  it('should work with lintDirtyModulesOnly disabled (default)', async () => {
    const compiler = pack('lint-all-files/entry', {
      lintAllFiles: true,
      lintDirtyModulesOnly: false,
    });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);

    const { errors } = stats.compilation;
    expect(errors.length).toBe(1);

    const [{ message }] = errors;
    expect(message).toEqual(expect.stringMatching('no-unused-vars'));
    expect(message).toEqual(expect.stringMatching('included.js'));
    expect(message).toEqual(expect.stringMatching('not-included.js'));
  });
});
