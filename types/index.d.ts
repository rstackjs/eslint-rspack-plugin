export = ESLintRspackPlugin;
declare class ESLintRspackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options?: Options);
  key: string;
  options: import('./options').PluginOptions;
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
declare namespace ESLintRspackPlugin {
  export { Compiler, Module, NormalModule, Options };
}
type Compiler = import('@rspack/core').Compiler;
type Module = import('@rspack/core').Module;
type NormalModule = import('@rspack/core').NormalModule;
type Options = import('./options').Options;
