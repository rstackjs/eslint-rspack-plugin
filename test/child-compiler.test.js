import { rspack } from '@rspack/core';
import conf from './utils/conf';

const PLUGIN_NAME = 'ChildPlugin';
class ChildPlugin {
  constructor(options) {
    this.options = rspack.config.getNormalizedRspackOptions(options);
  }

  apply(compiler) {
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const childCompiler = compilation.createChildCompiler(PLUGIN_NAME);
      rspack.EntryOptionPlugin.applyEntryOption(
        childCompiler,
        compilation.compiler.context,
        this.options.entry,
      );
      childCompiler.runAsChild(() => {
        callback();
      });
    });
  }
}

describe('child compiler', () => {
  it('should have linting process', (done) => {
    const config = conf('good', { threads: false });
    config.plugins.push(
      new ChildPlugin({
        entry: {
          child: './child-entry',
        },
      }),
    );
    rspack(config).run((err, stats) => {
      expect(err).toBeNull();
      expect(stats.hasErrors()).toBe(false);
      expect(stats.hasWarnings()).toBe(true);
      done();
    });
  });
});
