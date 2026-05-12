import pack from './utils/pack.js';

describe('warning handling', () => {
  it('should report ESLint warnings as Rspack errors when severity.warning is error', async () => {
    const compiler = pack('warn', { severity: { warning: 'error' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain('[eslint]');
  });

  it('should correctly identifies a success', async () => {
    const compiler = pack('good', { severity: { warning: 'error' } });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(false);
  });
});
