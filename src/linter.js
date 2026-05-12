import { dirname, isAbsolute, join } from 'node:path';

import ESLintError from './ESLintError.js';
import { getESLint } from './getESLint.js';

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
async function linter(options, compilation) {
  /** @type {ESLint} */
  let eslint;

  /** @type {(files: string|string[]) => Promise<LintResult[]>} */
  let lintFiles;

  /** @type {Promise<LintResult[]>[]} */
  const rawResults = [];

  try {
    ({ eslint, lintFiles } = await getESLint(options));
  } catch (e) {
    throw new ESLintError(e.message);
  }

  return {
    lint,
    report,
  };

  /**
   * @param {string | string[]} files
   */
  function lint(files) {
    rawResults.push(
      lintFiles(files).catch((e) => {
        // @ts-ignore
        compilation.errors.push(new ESLintError(e.message));
        return [];
      }),
    );
  }

  async function report() {
    // Filter out ignored files.
    const results = await removeIgnoredWarnings(
      eslint,
      // Get the current results, resetting the rawResults to empty
      await flatten(rawResults.splice(0, rawResults.length)),
    );

    // do not analyze if there are no results or eslint config
    if (!results || results.length < 1) {
      return {};
    }

    const formatter = await loadFormatter(eslint, options.formatter);
    const { errors, warnings } = await formatResults(
      formatter,
      parseResults(options, results),
    );

    return {
      errors,
      warnings,
      generateReportAsset,
    };

    /**
     * @param {Compilation} compilation
     * @returns {Promise<void>}
     */
    async function generateReportAsset({ compiler }) {
      const { outputReport } = options;
      /**
       * @param {string} name
       * @param {string | Buffer} content
       */
      const save = (name, content) =>
        /** @type {Promise<void>} */ (
          new Promise((finish, bail) => {
            // @ts-ignore
            const { mkdir, writeFile } = compiler.outputFileSystem;
            // ensure directory exists
            // @ts-ignore - the types for `outputFileSystem` are missing the 3 arg overload
            mkdir(dirname(name), { recursive: true }, (err) => {
              /* istanbul ignore if */
              if (err) bail(err);
              else
                writeFile(name, content, (/** @type {any} */ err2) => {
                  /* istanbul ignore if */
                  if (err2) bail(err2);
                  else finish();
                });
            });
          })
        );

      if (!outputReport || !outputReport.filePath) {
        return;
      }

      const content = await (outputReport.formatter
        ? (await loadFormatter(eslint, outputReport.formatter)).format(results)
        : formatter.format(results));

      let { filePath } = outputReport;
      if (!isAbsolute(filePath)) {
        filePath = join(compiler.outputPath, filePath);
      }

      await save(filePath, content);
    }
  }
}

/**
 * @param {Formatter} formatter
 * @param {{ errors: LintResult[]; warnings: LintResult[]; }} results
 * @returns {Promise<{errors?: ESLintError, warnings?: ESLintError}>}
 */
async function formatResults(formatter, results) {
  let errors;
  let warnings;
  if (results.warnings.length > 0) {
    warnings = new ESLintError(await formatter.format(results.warnings));
  }

  if (results.errors.length > 0) {
    errors = new ESLintError(await formatter.format(results.errors));
  }

  return {
    errors,
    warnings,
  };
}

/**
 * @param {Options} options
 * @param {LintResult[]} results
 * @returns {{errors: LintResult[], warnings: LintResult[]}}
 */
function parseResults(options, results) {
  /** @type {LintResult[]} */
  const errors = [];

  /** @type {LintResult[]} */
  const warnings = [];
  /** @type {{error: 'error' | 'warning' | 'off', warning: 'error' | 'warning' | 'off'}} */
  const severity = {
    error: 'error',
    warning: 'warning',
    ...options.severity,
  };

  results.forEach((file) => {
    /** @type {Record<'error' | 'warning', LintResult['messages']>} */
    const messagesByTarget = {
      error: [],
      warning: [],
    };

    for (const message of file.messages) {
      const target =
        message.severity === 2
          ? severity.error
          : message.severity === 1
            ? severity.warning
            : 'off';

      if (target === 'error' || target === 'warning') {
        messagesByTarget[target].push(message);
      }
    }

    if (messagesByTarget.error.length > 0) {
      errors.push({ ...file, messages: messagesByTarget.error });
    }

    if (messagesByTarget.warning.length > 0) {
      warnings.push({ ...file, messages: messagesByTarget.warning });
    }
  });

  return {
    errors,
    warnings,
  };
}

/**
 * @param {ESLint} eslint
 * @param {string|FormatterFunction=} formatter
 * @returns {Promise<Formatter>}
 */
async function loadFormatter(eslint, formatter) {
  if (typeof formatter === 'function') {
    return { format: formatter };
  }

  if (typeof formatter === 'string') {
    try {
      return eslint.loadFormatter(formatter);
    } catch (_) {
      // Load the default formatter.
    }
  }

  return eslint.loadFormatter();
}

/**
 * @param {ESLint} eslint
 * @param {LintResult[]} results
 * @returns {Promise<LintResult[]>}
 */
async function removeIgnoredWarnings(eslint, results) {
  const filterPromises = results.map(async (result) => {
    // Short circuit the call to isPathIgnored.
    //   fatal is false for ignored file warnings.
    //   ruleId is unset for internal ESLint errors.
    //   line is unset for warnings not involving file contents.
    const { messages, warningCount, errorCount, filePath } = result;
    const [firstMessage] = messages;
    const hasWarning = warningCount === 1 && errorCount === 0;
    const ignored =
      messages.length === 0 ||
      (hasWarning &&
        !firstMessage.fatal &&
        !firstMessage.ruleId &&
        !firstMessage.line &&
        (await eslint.isPathIgnored(filePath)));
    return ignored ? false : result;
  });

  // @ts-ignore
  return (await Promise.all(filterPromises)).filter(Boolean);
}

/**
 * @param {Promise<LintResult[]>[]} results
 * @returns {Promise<LintResult[]>}
 */
async function flatten(results) {
  /**
   * @param {LintResult[]} acc
   * @param {LintResult[]} list
   */
  const flat = (acc, list) => [...acc, ...list];
  return (await Promise.all(results)).reduce(flat, []);
}

export default linter;
