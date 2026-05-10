import pack from './utils/pack';

describe('fail on error', () => {
  it('should fail the build when failOnError is enabled', async () => {
    const compiler = pack('error', { failOnError: true });

    await expect(compiler.runAsync()).rejects.toThrow();
  });

  it('should not fail the build when failOnError is disabled', async () => {
    const compiler = pack('error', { failOnError: false });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it('should correctly identifies a success', async () => {
    const compiler = pack('good', { failOnError: true });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
