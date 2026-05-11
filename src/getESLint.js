import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

import { getESLintOptions } from './options.js';

/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./options.js').Options} Options */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{eslint: ESLint, lintFiles: LintTask}} Linter */
/** @typedef {{new (arg0: ESLintOptions): ESLint, outputFixes: (arg0: LintResult[]) => Promise<void>}} ESLintClass */

const moduleRequire = createRequire(import.meta.url);

/**
 * @param {Options} options
 * @returns {Promise<Linter>}
 */
async function getESLint(options) {
  const eslintModule = await loadESLintModule(options.eslintPath || 'eslint');

  if (typeof eslintModule.loadESLint !== 'function') {
    throw new Error(
      'eslint-rspack-plugin requires ESLint 9 or later. Make sure eslintPath resolves to an ESLint 9+ module that exports loadESLint().',
    );
  }

  const eslintOptions = getESLintOptions(options);
  const fix = Boolean(eslintOptions && eslintOptions.fix);

  /** @type {ESLintClass} */
  const ESLint = await eslintModule.loadESLint({
    useFlatConfig: options.configType === 'flat',
  });

  /** @type {ESLint} */
  const eslint = new ESLint(eslintOptions);

  /**
   * @param {string|string[]} files
   * @returns {Promise<LintResult[]>}
   */
  async function lintFiles(files) {
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

/**
 * @param {string} specifier
 * @returns {Promise<Record<string, any>>}
 */
async function loadESLintModule(specifier) {
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
    const resolvedPath = moduleRequire.resolve(specifier);
    return normalizeModule(await import(pathToFileURL(resolvedPath).href));
  }
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
function isImportResolutionError(error) {
  if (!error || typeof error !== 'object') return false;

  const { code } = /** @type {{ code?: string }} */ (error);
  return (
    code === 'ERR_MODULE_NOT_FOUND' ||
    code === 'ERR_UNSUPPORTED_DIR_IMPORT' ||
    code === 'MODULE_NOT_FOUND'
  );
}

/**
 * @param {Record<string, any>} module
 * @returns {Record<string, any>}
 */
function normalizeModule(module) {
  return module.default && typeof module.default === 'object'
    ? { ...module.default, ...module }
    : module;
}

export { getESLint };
