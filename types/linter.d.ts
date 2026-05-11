export default linter;
export type ESLint = import('eslint').ESLint;
export type Formatter = import('eslint').ESLint.Formatter;
export type LintResult = import('eslint').ESLint.LintResult;
export type Compilation = import('@rspack/core').Compilation;
export type Options = import('./options.js').Options;
export type FormatterFunction = import('./options.js').FormatterFunction;
export type GenerateReport = (compilation: Compilation) => Promise<void>;
export type Report = {
  errors?: ESLintError;
  warnings?: ESLintError;
  generateReportAsset?: GenerateReport;
};
export type Reporter = () => Promise<Report>;
export type Linter = (files: string | string[]) => void;
/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Formatter} Formatter */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('@rspack/core').Compilation} Compilation */
/** @typedef {import('./options.js').Options} Options */
/** @typedef {import('./options.js').FormatterFunction} FormatterFunction */
/** @typedef {(compilation: Compilation) => Promise<void>} GenerateReport */
/** @typedef {{errors?: ESLintError, warnings?: ESLintError, generateReportAsset?: GenerateReport}} Report */
/** @typedef {() => Promise<Report>} Reporter */
/** @typedef {(files: string|string[]) => void} Linter */
/**
 * @param {Options} options
 * @param {Compilation} compilation
 * @returns {Promise<{lint: Linter, report: Reporter}>}
 */
declare function linter(
  options: Options,
  compilation: Compilation,
): Promise<{
  lint: Linter;
  report: Reporter;
}>;
import ESLintError from './ESLintError.js';
