import { rspack } from '@rspack/core';
import conf from './utils/conf.js';

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
  it('should have linting process', () =>
    new Promise((resolve, reject) => {
      const config = conf('good');
      config.plugins.push(
        new ChildPlugin({
          entry: {
            child: './child-entry',
          },
        }),
      );
      rspack(config).run((err, stats) => {
        try {
          expect(err).toBeNull();
          expect(stats.hasErrors()).toBe(false);
          expect(stats.hasWarnings()).toBe(true);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }));
});
