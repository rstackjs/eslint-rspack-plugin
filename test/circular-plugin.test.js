import { ESLint } from 'eslint';

import pack from './utils/pack';

let hasFlatESLint = false;

try {
  const { FlatESLint } = require('eslint/use-at-your-own-risk');
  hasFlatESLint = Boolean(FlatESLint);
} catch (_) {
  hasFlatESLint = false;
}

const eslintVersion = ESLint && parseFloat(ESLint.version);
const describeIfFlatConfigIsAvailable =
  eslintVersion >= 9 || hasFlatESLint ? describe : describe.skip;

describeIfFlatConfigIsAvailable('circular plugin', () => {
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
      ...(eslintVersion < 9
        ? { eslintPath: 'eslint/use-at-your-own-risk' }
        : {}),
      overrideConfig: {
        plugins: {
          plugin,
        },
      },
      overrideConfigFile: true,
      threads: 1,
    });

    const stats = await compiler.runAsync();

    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(false);
  });
});
