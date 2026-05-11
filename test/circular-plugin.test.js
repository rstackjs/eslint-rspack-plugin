import pack from './utils/pack.js';

describe('circular plugin', () => {
  it('should support plugins with circular configs', async () => {
    const plugin = {
      configs: {},
      processors: {},
      rules: {},
    };

    Object.assign(plugin.configs, {
      recommended: {
        plugins: {
          self: plugin,
        },
        rules: {},
      },
    });

    const compiler = pack('good', {
      configType: 'flat',
      overrideConfig: {
        plugins: {
          plugin,
        },
      },
      overrideConfigFile: true,
    });

    const stats = await compiler.runAsync();

    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
