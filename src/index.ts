import { isAbsolute, join } from 'node:path';

import micromatch from 'micromatch';
import { globSync } from 'tinyglobby';

import linter from './linter.js';
import { getOptions } from './options.js';
import { arrify, parseFiles, parseFoldersToGlobs } from './utils.js';
import type { Linter, Reporter } from './linter.js';
import type { Options, ResolvedOptions } from './options.js';
import type { Compiler, Module, NormalModule, RspackError } from '@rspack/core';

const { isMatch } = micromatch;

const ESLINT_PLUGIN = 'ESLintRspackPlugin';
const DEFAULT_FOLDER_TO_EXCLUDE = '**/node_modules/**';

let compilerId = 0;

type RunOptions = Omit<ResolvedOptions, 'resourceQueryExclude'> & {
  resourceQueryExclude: RegExp[];
  extensions: string[];
  files: string[];
  exclude: string[];
};
type CompilationHookWithTaps = Compiler['hooks']['compilation'] & {
  taps: Array<{ name?: string }>;
};

class ESLintRspackPlugin {
  key: string;
  options: ResolvedOptions;

  constructor(options: Options = {}) {
    this.key = ESLINT_PLUGIN;
    this.options = getOptions(options);
    this.run = this.run.bind(this);
  }

  apply(compiler: Compiler): void {
    // Generate key for each compilation,
    // this differentiates one from the other when being cached.
    this.key = compiler.name || `${this.key}_${(compilerId += 1)}`;

    const excludedFiles = parseFiles(
      this.options.exclude || [],
      this.getContext(compiler),
    );
    const resourceQueries = arrify(this.options.resourceQueryExclude || []);
    const excludedResourceQueries = resourceQueries.map(
      (item: RegExp | string) =>
        item instanceof RegExp ? item : new RegExp(item),
    );

    const options: RunOptions = {
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

  async run(
    compiler: Compiler,
    options: RunOptions,
    wanted: string[],
    exclude: string[],
  ): Promise<void> {
    const compilationHook = compiler.hooks
      .compilation as CompilationHookWithTaps;
    const isCompilerHooked = compilationHook.taps.find(
      ({ name }) => name === this.key,
    );

    if (isCompilerHooked) return;

    compiler.hooks.compilation.tap(this.key, async (compilation) => {
      let lint: Linter;
      let report: Reporter;

      const files: string[] = [];

      let linterError: Error | null = null;
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
          compilation.errors.push(e as RspackError);
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
      compilation.hooks.processAssets.tapPromise(this.key, processResults);

      /**
       * This two hooks will cause performance problem for rspack
       */
      // compilation.hooks.succeedModule.tap(this.key, addFile);
      // compilation.hooks.stillValidModule.tap(this.key, addFile);

      function addFile(module: Module): void {
        const { resource } = module as NormalModule;

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
          for (const m of compilation.builtModules) {
            addFile(m);
          }
        }
        setupLinter.then(scheduleLint);
      });

      function scheduleLint(): void {
        if (linterError || hasLinted || files.length < 1) return;

        hasLinted = true;
        lint(files);
      }

      async function processResults(): Promise<void> {
        await setupLinter;

        if (linterError) {
          return;
        }

        scheduleLint();

        const { errors, warnings, generateReportAsset } = await report();

        if (warnings) {
          compilation.warnings.push(warnings as RspackError);
        }

        if (errors) {
          compilation.errors.push(errors as RspackError);
        }

        if (generateReportAsset) await generateReportAsset(compilation);
      }
    });
  }

  getContext(compiler: Compiler): string {
    const compilerContext = String(compiler.options.context);
    const optionContext = this.options.context;

    if (!optionContext) return compilerContext;

    if (isAbsolute(optionContext)) return optionContext;

    return join(compilerContext, optionContext);
  }
}

export default ESLintRspackPlugin;
