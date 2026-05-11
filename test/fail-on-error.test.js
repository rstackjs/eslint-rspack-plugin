import pack from './utils/pack.js';

describe('fail on error', () => {
  it('should fail the build by default outside development mode', async () => {
    const compiler = pack('error', {}, { mode: 'production' });

    await expect(compiler.runAsync()).rejects.toThrow();
  });

  it('should not fail the build by default in development mode', async () => {
    const compiler = pack('error');

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

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
