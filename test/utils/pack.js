import { rspack } from '@rspack/core';
import conf from './conf.js';

/**
 * new a test webpack compiler
 * @param {String} context
 * @param {import('../../src/options').Options} pluginConf
 * @param {webpack.Configuration} webpackConf
 * @returns {ReturnType<webpack>}
 */
export default (context, pluginConf = {}, webpackConf = {}) => {
  const compiler = rspack(conf(context, pluginConf, webpackConf));

  return {
    runAsync() {
      return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
          if (err) {
            reject(err);
          } else {
            resolve(stats);
          }
        });
      });
    },
    watch(options, fn) {
      return compiler.watch(options, fn);
    },
  };
};
