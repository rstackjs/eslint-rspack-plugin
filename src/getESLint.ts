import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { getESLintOptions } from './options.js';
import type { Options } from './options.js';
import type { ESLint as ESLintType } from 'eslint';

type ESLintOptions = ESLintType.Options;
type LintResult = ESLintType.LintResult;
type LintTask = (files: string | string[]) => Promise<LintResult[]>;
type Linter = { eslint: ESLintType; lintFiles: LintTask };
type ESLintClass = {
  new (arg0: ESLintOptions): ESLintType;
  outputFixes: (arg0: LintResult[]) => Promise<void>;
};
type ESLintModule = Record<string, unknown> & {
  loadESLint?: (arg0: { useFlatConfig: boolean }) => Promise<ESLintClass>;
};

const moduleRequire = createRequire(import.meta.url);

async function getESLint(options: Options): Promise<Linter> {
  const eslintModule = await loadESLintModule(options.eslintPath || 'eslint');

  if (typeof eslintModule.loadESLint !== 'function') {
    throw new Error(
      'eslint-rspack-plugin requires ESLint 9 or later. Make sure eslintPath resolves to an ESLint 9+ module that exports loadESLint().',
    );
  }

  const eslintOptions = getESLintOptions(options);
  const fix = Boolean(eslintOptions && eslintOptions.fix);

  const ESLint = await eslintModule.loadESLint({
    useFlatConfig: options.configType === 'flat',
  });

  const eslint = new ESLint(eslintOptions);

  async function lintFiles(files: string | string[]): Promise<LintResult[]> {
    const results = await eslint.lintFiles(files);

    if (fix) {
      await ESLint.outputFixes(results);
    }

    return results;
  }

  return {
    eslint,
    lintFiles,
  };
}

async function loadESLintModule(specifier: string): Promise<ESLintModule> {
  if (isAbsolutePathSpecifier(specifier)) {
    return loadResolvedModule(specifier);
  }

  try {
    // Prefer native ESM resolution for package specifiers so conditional
    // exports use the import-compatible entry.
    return normalizeModule(await import(specifier));
  } catch (e) {
    if (!isImportResolutionError(e)) {
      throw e;
    }

    // Fall back to CommonJS resolution only for legacy path-style eslintPath
    // values, such as directories that ESM import cannot resolve directly.
    return loadResolvedModule(specifier);
  }
}

async function loadResolvedModule(specifier: string): Promise<ESLintModule> {
  const resolvedPath = moduleRequire.resolve(specifier);
  return normalizeModule(await import(pathToFileURL(resolvedPath).href));
}

function isAbsolutePathSpecifier(specifier: string): boolean {
  return path.isAbsolute(specifier) || path.win32.isAbsolute(specifier);
}

function isImportResolutionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const { code } = error as { code?: string };
  return (
    code === 'ERR_MODULE_NOT_FOUND' ||
    code === 'ERR_UNSUPPORTED_DIR_IMPORT' ||
    code === 'MODULE_NOT_FOUND'
  );
}

function normalizeModule(module: Record<string, unknown>): ESLintModule {
  return module.default && typeof module.default === 'object'
    ? ({
        ...(module.default as Record<string, unknown>),
        ...module,
      } as ESLintModule)
    : (module as ESLintModule);
}

export { getESLint };
