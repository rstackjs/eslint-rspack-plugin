import { isAbsolute, join } from 'node:path';

import micromatch from 'micromatch';
import { globSync } from 'tinyglobby';

import linter from './linter.js';
import { getOptions } from './options.js';
import { arrify, parseFiles, parseFoldersToGlobs } from './utils.js';

const { isMatch } = micromatch;

/** @typedef {import('@rspack/core').Compiler} Compiler */
/** @typedef {import('@rspack/core').Module} Module */
/** @typedef {import('@rspack/core').NormalModule} NormalModule */
/** @typedef {import('./options.js').Options} Options */

const ESLINT_PLUGIN = 'ESLintRspackPlugin';
const DEFAULT_FOLDER_TO_EXCLUDE = '**/node_modules/**';

let compilerId = 0;

class ESLintRspackPlugin {
  /**
   * @param {Options} options
   */
  constructor(options = {}) {
    this.key = ESLINT_PLUGIN;
    this.options = getOptions(options);
    this.run = this.run.bind(this);
  }

  /**
   * @param {Compiler} compiler
   * @returns {void}
   */
  apply(compiler) {
    // Generate key for each compilation,
    // this differentiates one from the other when being cached.
    this.key = compiler.name || `${this.key}_${(compilerId += 1)}`;
    if (this.options.failOnError === undefined) {
      this.options.failOnError = compiler.options.mode !== 'development';
    }

    const excludedFiles = parseFiles(
      this.options.exclude || [],
      this.getContext(compiler),
    );
    const resourceQueries = arrify(this.options.resourceQueryExclude || []);
    const excludedResourceQueries = resourceQueries.map((item) =>
      item instanceof RegExp ? item : new RegExp(item),
    );

    const options = {
      ...this.options,
      exclude: excludedFiles,
      resourceQueryExclude: excludedResourceQueries,
      extensions: arrify(this.options.extensions),
      files: parseFiles(this.options.files || '', this.getContext(compiler)),
    };

    const foldersToExclude = this.options.exclude
      ? options.exclude
      : DEFAULT_FOLDER_TO_EXCLUDE;
    const exclude = parseFoldersToGlobs(foldersToExclude);
    const wanted = parseFoldersToGlobs(options.files, options.extensions);

    // If `lintDirtyModulesOnly` is disabled,
    // execute the linter on the build
    if (!this.options.lintDirtyModulesOnly) {
      compiler.hooks.run.tapPromise(this.key, (c) =>
        this.run(c, options, wanted, exclude),
      );
    }

    let hasCompilerRunByDirtyModule = this.options.lintDirtyModulesOnly;

    compiler.hooks.watchRun.tapPromise(this.key, (c) => {
      if (!hasCompilerRunByDirtyModule)
        return this.run(c, options, wanted, exclude);

      hasCompilerRunByDirtyModule = false;

      return Promise.resolve();
    });
  }

  /**
   * @param {Compiler} compiler
   * @param {Omit<Options, 'resourceQueryExclude'> & {resourceQueryExclude: RegExp[]}} options
   * @param {string[]} wanted
   * @param {string[]} exclude
   */
  async run(compiler, options, wanted, exclude) {
    // @ts-ignore
    const isCompilerHooked = compiler.hooks.compilation.taps.find(
      ({ name }) => name === this.key,
    );

    if (isCompilerHooked) return;

    compiler.hooks.compilation.tap(this.key, async (compilation) => {
      /** @type {import('./linter.js').Linter} */
      let lint;
      /** @type {import('./linter.js').Reporter} */
      let report;

      /** @type {string[]} */
      const files = [];

      /** @type {Error | null} */
      let linterError = null;
      let hasLinted = false;

      const shouldLintAllFiles = this.options.lintAllFiles;
      const allMatchingFiles = shouldLintAllFiles
        ? globSync(wanted, { dot: true, ignore: exclude })
        : [];

      const setupLinter = linter(options, compilation)
        .then((result) => {
          ({ lint, report } = result);
        })
        .catch((e) => {
          linterError = e;
          compilation.errors.push(e);
        });

      // Register compilation hooks before waiting for linter setup.
      // Awaiting linter setup here can make later hooks register too late in Rspack.
      compilation.hooks.finishModules.tap(this.key, (modules) => {
        if (!this.options.lintDirtyModulesOnly && !shouldLintAllFiles) {
          for (const m of modules) {
            addFile(m);
          }
        }
      });

      // await and interpret results
      compilation.hooks.processAssets.tapAsync(
        this.key,
        /**
         * @param {Record<string, unknown>} _assets
         * @param {(error?: Error | null) => void} callback
         */
        (_assets, callback) => {
          processResults().then(
            (error) => callback(error),
            (error) => callback(error),
          );
        },
      );

      /**
       * This two hooks will cause performance problem for rspack
       */
      // compilation.hooks.succeedModule.tap(this.key, addFile);
      // compilation.hooks.stillValidModule.tap(this.key, addFile);

      /**
       * @param {Module} module
       */
      function addFile(module) {
        const { resource } = /** @type {NormalModule} */ (module);

        if (!resource) return;

        const [file, query] = resource.split('?');
        const isFileNotListed = file && !files.includes(file);
        const isFileWanted =
          isMatch(file, wanted, { dot: true }) &&
          !isMatch(file, exclude, { dot: true });
        const isQueryNotExclude = options.resourceQueryExclude.every(
          (reg) => !reg.test(query),
        );

        if (isFileNotListed && isFileWanted && isQueryNotExclude) {
          files.push(file);
        }
      }

      // Lint all files added
      // DIFF: use seal hook to make sure built modules exists
      compilation.hooks.seal.tap(this.key, () => {
        if (shouldLintAllFiles) {
          for (const file of allMatchingFiles) {
            if (!files.includes(file)) {
              files.push(file);
            }
          }
        } else if (this.options.lintDirtyModulesOnly) {
          for (const m of /** @type {Set<Module>} */ (
            compilation.builtModules
          )) {
            addFile(m);
          }
        }
        setupLinter.then(scheduleLint);
      });

      function scheduleLint() {
        if (linterError || hasLinted || files.length < 1) return;

        hasLinted = true;
        lint(files);
      }

      async function processResults() {
        await setupLinter;

        if (linterError) {
          return options.failOnError ? linterError : null;
        }

        scheduleLint();

        const { errors, warnings, generateReportAsset } = await report();

        if (warnings) {
          // @ts-ignore
          compilation.warnings.push(warnings);
        }

        if (errors) {
          // @ts-ignore
          compilation.errors.push(errors);
        }

        if (generateReportAsset) await generateReportAsset(compilation);

        if (errors && options.failOnError) {
          return errors;
        }

        if (warnings && options.failOnWarning) {
          return warnings;
        }

        return null;
      }
    });
  }

  /**
   *
   * @param {Compiler} compiler
   * @returns {string}
   */
  getContext(compiler) {
    const compilerContext = String(compiler.options.context);
    const optionContext = this.options.context;

    if (!optionContext) return compilerContext;

    if (isAbsolute(optionContext)) return optionContext;

    return join(compilerContext, optionContext);
  }
}

export default ESLintRspackPlugin;
