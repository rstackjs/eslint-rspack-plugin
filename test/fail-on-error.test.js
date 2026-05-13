import pack from './utils/pack.js';

describe('error handling', () => {
  it('should report ESLint errors as Rspack errors outside development mode', async () => {
    const compiler = pack('error', {}, { mode: 'production' });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain('[eslint]');
  });

  it('should report ESLint errors as Rspack errors in development mode', async () => {
    const compiler = pack('error');

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it('should report ESLint errors as Rspack warnings when severity.error is warning', async () => {
    const compiler = pack('error', { severity: { error: 'warning' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
    expect(stats.compilation.warnings[0].message).toContain('[eslint]');
  });

  it('should correctly identifies a success', async () => {
    const compiler = pack('good', { severity: { error: 'error' } });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
