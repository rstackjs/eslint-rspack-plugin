export default ESLintRspackPlugin;
export type Compiler = import('@rspack/core').Compiler;
export type Module = import('@rspack/core').Module;
export type NormalModule = import('@rspack/core').NormalModule;
export type Options = import('./options.js').Options;
declare class ESLintRspackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options?: Options);
  key: string;
  options: import('./options.js').PluginOptions;
  /**
   * @param {Compiler} compiler
   * @param {Omit<Options, 'resourceQueryExclude'> & {resourceQueryExclude: RegExp[]}} options
   * @param {string[]} wanted
   * @param {string[]} exclude
   */
  run(
    compiler: Compiler,
    options: Omit<Options, 'resourceQueryExclude'> & {
      resourceQueryExclude: RegExp[];
    },
    wanted: string[],
    exclude: string[],
  ): Promise<void>;
  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler: Compiler): void;
  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
   */
  getContext(compiler: Compiler): string;
}
