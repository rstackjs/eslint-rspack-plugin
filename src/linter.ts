import { dirname, isAbsolute, join } from 'node:path';

import ESLintError from './ESLintError.js';
import { getESLint } from './getESLint.js';
import type { FormatterFunction, Options, SeverityOptions } from './options.js';
import type { Compilation, RspackError } from '@rspack/core';
import type { ESLint } from 'eslint';

type Formatter = ESLint.Formatter;
type LintResult = ESLint.LintResult;
export type GenerateReport = (compilation: Compilation) => Promise<void>;
export type Report = {
  errors?: ESLintError;
  warnings?: ESLintError;
  generateReportAsset?: GenerateReport;
};
export type Reporter = () => Promise<Report>;
export type Linter = (files: string | string[]) => void;
type DiagnosticSeverity = 'error' | 'warning';
type OutputFileSystem = {
  mkdir: (
    name: string,
    options: { recursive: boolean },
    callback: (err?: NodeJS.ErrnoException | null) => void,
  ) => void;
  writeFile: (
    name: string,
    content: string | Buffer,
    callback: (err?: NodeJS.ErrnoException | null) => void,
  ) => void;
};

async function linter(
  options: Options,
  compilation: Compilation,
): Promise<{ lint: Linter; report: Reporter }> {
  let eslint: ESLint;

  let lintFiles: (files: string | string[]) => Promise<LintResult[]>;

  const rawResults: Array<Promise<LintResult[]>> = [];

  try {
    ({ eslint, lintFiles } = await getESLint(options));
  } catch (e) {
    throw new ESLintError(e.message);
  }

  return {
    lint,
    report,
  };

  function lint(files: string | string[]): void {
    rawResults.push(
      lintFiles(files).catch((e) => {
        compilation.errors.push(new ESLintError(e.message) as RspackError);
        return [];
      }),
    );
  }

  async function report(): Promise<Report> {
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

    async function generateReportAsset({
      compiler,
    }: Compilation): Promise<void> {
      const { outputReport } = options;
      const save = (name: string, content: string | Buffer): Promise<void> =>
        new Promise((finish, bail) => {
          const { mkdir, writeFile } =
            compiler.outputFileSystem as unknown as OutputFileSystem;
          // ensure directory exists
          mkdir(dirname(name), { recursive: true }, (err) => {
            /* istanbul ignore if */
            if (err) bail(err);
            else
              writeFile(name, content, (err2) => {
                /* istanbul ignore if */
                if (err2) bail(err2);
                else finish();
              });
          });
        });

      if (
        !outputReport ||
        typeof outputReport === 'boolean' ||
        !outputReport.filePath
      ) {
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

async function formatResults(
  formatter: Formatter,
  results: { errors: LintResult[]; warnings: LintResult[] },
): Promise<{ errors?: ESLintError; warnings?: ESLintError }> {
  let errors: ESLintError | undefined;
  let warnings: ESLintError | undefined;
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

function parseResults(
  options: Options,
  results: LintResult[],
): { errors: LintResult[]; warnings: LintResult[] } {
  const errors: LintResult[] = [];

  const warnings: LintResult[] = [];
  const severity: Required<SeverityOptions> = {
    error: 'error',
    warning: 'warning',
    ...options.severity,
  };

  results.forEach((file) => {
    const messagesByTarget: Record<DiagnosticSeverity, LintResult['messages']> =
      {
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
      errors.push(createSeverityResult(file, 'error', messagesByTarget.error));
    }

    if (messagesByTarget.warning.length > 0) {
      warnings.push(
        createSeverityResult(file, 'warning', messagesByTarget.warning),
      );
    }
  });

  return {
    errors,
    warnings,
  };
}

function createSeverityResult(
  file: LintResult,
  severity: DiagnosticSeverity,
  messages: LintResult['messages'],
): LintResult {
  const eslintSeverity: 1 | 2 = severity === 'error' ? 2 : 1;
  const normalizedMessages: LintResult['messages'] = messages.map(
    (message) => ({
      ...message,
      severity: eslintSeverity,
    }),
  );
  const fixableCount = normalizedMessages.filter((message) =>
    Boolean(message.fix),
  ).length;

  return {
    ...file,
    messages: normalizedMessages,
    errorCount: severity === 'error' ? normalizedMessages.length : 0,
    warningCount: severity === 'warning' ? normalizedMessages.length : 0,
    fatalErrorCount:
      severity === 'error'
        ? normalizedMessages.filter((message) => message.fatal).length
        : 0,
    fixableErrorCount: severity === 'error' ? fixableCount : 0,
    fixableWarningCount: severity === 'warning' ? fixableCount : 0,
  };
}

async function loadFormatter(
  eslint: ESLint,
  formatter?: string | FormatterFunction,
): Promise<Formatter> {
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

async function removeIgnoredWarnings(
  eslint: ESLint,
  results: LintResult[],
): Promise<LintResult[]> {
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
        firstMessage !== undefined &&
        !firstMessage.fatal &&
        !firstMessage.ruleId &&
        !firstMessage.line &&
        (await eslint.isPathIgnored(filePath)));
    return ignored ? false : result;
  });

  return (await Promise.all(filterPromises)).filter(
    (result): result is LintResult => Boolean(result),
  );
}

async function flatten(
  results: Array<Promise<LintResult[]>>,
): Promise<LintResult[]> {
  const flat = (acc: LintResult[], list: LintResult[]): LintResult[] => [
    ...acc,
    ...list,
  ];
  return (await Promise.all(results)).reduce(flat, []);
}

export default linter;
