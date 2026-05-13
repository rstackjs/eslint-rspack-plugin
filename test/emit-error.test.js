import pack from './utils/pack.js';

describe('error severity', () => {
  it('should not emit ESLint errors if severity.error is off', async () => {
    const compiler = pack('error', { severity: { error: 'off' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });

  it('should emit ESLint errors as Rspack errors by default', async () => {
    const compiler = pack('error', {});

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it('should emit ESLint errors as Rspack errors if severity.error is error', async () => {
    const compiler = pack('error', { severity: { error: 'error' } });

    const stats = await compiler.runAsync();
    expect(stats.hasErrors()).toBe(true);
  });

  it('should emit ESLint errors as Rspack warnings if severity.error is warning', async () => {
    const compiler = pack('error', { severity: { error: 'warning' } });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(false);
    expect(stats.compilation.warnings[0].message).toContain('[eslint]');
    expect(stats.compilation.warnings[0].message).toContain('3 warnings');
    expect(stats.compilation.warnings[0].message).not.toContain('3 errors');
  });

  it('should emit ESLint errors but not ESLint warnings if severity.warning is off', async () => {
    const compiler = pack('full-of-problems', {
      severity: {
        warning: 'off',
      },
    });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });

  it('should emit ESLint errors and warnings by default', async () => {
    const compiler = pack('full-of-problems', {});

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(true);
    expect(stats.hasErrors()).toBe(true);
  });
});
