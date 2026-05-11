import pack from './utils/pack.js';

describe('ok', () => {
  it("should don't throw error if file is ok", async () => {
    const compiler = pack('good');

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
