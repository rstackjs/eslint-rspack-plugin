const { getESLintOptions } = require('./options');

/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('./options').Options} Options */
/** @typedef {(files: string|string[]) => Promise<LintResult[]>} LintTask */
/** @typedef {{eslint: ESLint, lintFiles: LintTask}} Linter */
/** @typedef {{new (arg0: ESLintOptions): ESLint, outputFixes: (arg0: LintResult[]) => Promise<void>}} ESLintClass */

/**
 * @param {Options} options
 * @returns {Promise<Linter>}
 */
async function getESLint(options) {
  const eslintModule = require(options.eslintPath || 'eslint');

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

module.exports = {
  getESLint,
};
