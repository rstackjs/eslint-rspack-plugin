import formatter from './mock/formatter/index.js';
import pack from './utils/pack.js';

describe('formatter eslint', () => {
  it('should use custom formatter as function', async () => {
    const compiler = pack('error', { formatter });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
    const message = JSON.parse(
      stats.compilation.errors[0].message
        .replace('× ESLintError: [eslint]', '')
        .replace('× [eslint]', ''),
    );
    expect(message.formatter).toEqual('mock');
    expect(message.results).toBeTruthy();
  });

  it('should use custom formatter as string', async () => {
    const formatter = './test/mock/formatter/index.js';
    const compiler = pack('error', { formatter });

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
    expect(stats.compilation.errors[0].message).toBeTruthy();
    const message = JSON.parse(
      stats.compilation.errors[0].message
        .replace('× ESLintError: [eslint]', '')
        .replace('× [eslint]', ''),
    );
    expect(message.formatter).toEqual('mock');
    expect(message.results).toBeTruthy();
  });
});
