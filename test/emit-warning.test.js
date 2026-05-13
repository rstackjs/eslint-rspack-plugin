import pack from './utils/pack.js';

describe('warning severity', () => {
  it('should not emit ESLint warnings if severity.warning is off', async () => {
    const compiler = pack('warn', { severity: { warning: 'off' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should emit ESLint warnings as Rspack warnings by default', async () => {
    const compiler = pack('warn', {});

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should emit ESLint warnings as Rspack warnings if severity.warning is warning', async () => {
    const compiler = pack('warn', { severity: { warning: 'warning' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should emit ESLint warnings as Rspack errors if severity.warning is error', async () => {
    const compiler = pack('warn', { severity: { warning: 'error' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toContain('[eslint]');
    expect(stats.compilation.errors[0].message).toContain('1 error');
    expect(stats.compilation.errors[0].message).not.toContain('1 warning');
  });

  it('should emit ESLint warnings but not ESLint errors if severity.error is off', async () => {
    const compiler = pack('full-of-problems', {
      severity: {
        error: 'off',
      },
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should emit ESLint warnings and errors by default', async () => {
    const compiler = pack('full-of-problems', {});

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(true);
  });
});
