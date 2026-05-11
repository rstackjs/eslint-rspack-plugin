export = linter;
/** @typedef {import('eslint').ESLint} ESLint */
/** @typedef {import('eslint').ESLint.Formatter} Formatter */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('@rspack/core').Compilation} Compilation */
/** @typedef {import('./options').Options} Options */
/** @typedef {import('./options').FormatterFunction} FormatterFunction */
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
declare namespace linter {
  export {
    ESLint,
    Formatter,
    LintResult,
    Compilation,
    Options,
    FormatterFunction,
    GenerateReport,
    Report,
    Reporter,
    Linter,
  };
}
type ESLint = import('eslint').ESLint;
type Formatter = import('eslint').ESLint.Formatter;
type LintResult = import('eslint').ESLint.LintResult;
type Compilation = import('@rspack/core').Compilation;
type Options = import('./options').Options;
type FormatterFunction = import('./options').FormatterFunction;
type GenerateReport = (compilation: Compilation) => Promise<void>;
type Report = {
  errors?: ESLintError;
  warnings?: ESLintError;
  generateReportAsset?: GenerateReport;
};
type Reporter = () => Promise<Report>;
type Linter = (files: string | string[]) => void;
import ESLintError = require('./ESLintError');
