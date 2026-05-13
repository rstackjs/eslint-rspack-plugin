import type { ESLint } from 'eslint';

type ESLintOptions = ESLint.Options;
type LintResult = ESLint.LintResult;
type LintResultData = ESLint.LintResultData;

export type FormatterFunction = (
  results: LintResult[],
  data?: LintResultData,
) => string;

export type OutputReport =
  | boolean
  | {
      filePath?: string;
      formatter?: string | FormatterFunction;
    };

export type Severity = 'error' | 'warning' | 'off';

export type SeverityOptions = {
  error?: Severity;
  warning?: Severity;
};

export type PluginOptions = {
  context?: string;
  eslintPath?: string;
  exclude?: string | string[];
  extensions?: string | string[];
  files?: string | string[];
  fix?: boolean;
  formatter?: string | FormatterFunction;
  lintDirtyModulesOnly?: boolean;
  lintAllFiles?: boolean;
  severity?: SeverityOptions;
  outputReport?: OutputReport;
  resourceQueryExclude?: RegExp | RegExp[];
  configType?: string;
};

export type Options = PluginOptions & ESLintOptions;

export type ResolvedOptions = Options & {
  cache: boolean;
  cacheLocation: string;
  configType: string;
  extensions: string | string[];
  resourceQueryExclude: RegExp | RegExp[];
  severity: Required<SeverityOptions>;
};

const removedOptionMessages: Record<string, string> = {
  emitError: "Use `severity.error: 'off'` to hide ESLint errors.",
  emitWarning: "Use `severity.warning: 'off'` to hide ESLint warnings.",
  failOnError:
    "ESLint errors are emitted as Rspack errors by default. Use `severity.error: 'warning'` to keep ESLint error output without failing the build.",
  failOnWarning:
    "Use `severity.warning: 'error'` to emit ESLint warnings as Rspack errors.",
  quiet: "Use `severity.warning: 'off'` to hide ESLint warnings.",
};

const pluginOnlyOptionKeys: Array<keyof PluginOptions> = [
  'configType',
  'context',
  'eslintPath',
  'exclude',
  'resourceQueryExclude',
  'files',
  'formatter',
  'lintDirtyModulesOnly',
  'lintAllFiles',
  'severity',
  'outputReport',
];

function getOptions(pluginOptions: Options): ResolvedOptions {
  assertNoRemovedOptions(pluginOptions);

  const defaultSeverity: Required<SeverityOptions> = {
    error: 'error',
    warning: 'warning',
  };
  const severity: Required<SeverityOptions> = {
    ...defaultSeverity,
    ...pluginOptions.severity,
  };

  return {
    cache: true,
    cacheLocation: 'node_modules/.cache/eslint-rspack-plugin/.eslintcache',
    configType: 'flat',
    extensions: 'js',
    resourceQueryExclude: [],
    ...pluginOptions,
    severity,
  };
}

function getESLintOptions(loaderOptions: Options): ESLintOptions {
  assertNoRemovedOptions(loaderOptions);

  const eslintOptions: Options = { ...loaderOptions };

  for (const option of pluginOnlyOptionKeys) {
    delete eslintOptions[option];
  }

  // Some options aren't available in flat mode
  if (loaderOptions.configType === 'flat') {
    delete eslintOptions.extensions;
  }

  return eslintOptions;
}

function assertNoRemovedOptions(options: object): void {
  const removedOptions = Object.keys(removedOptionMessages).filter((option) =>
    Object.prototype.hasOwnProperty.call(options, option),
  );

  if (removedOptions.length < 1) return;

  const details = removedOptions.map(
    (option) => `- \`${option}\` was removed. ${removedOptionMessages[option]}`,
  );

  throw new Error(
    [
      'eslint-rspack-plugin received removed options.',
      ...details,
      'Use the `severity` option to control ESLint diagnostic output.',
    ].join('\n'),
  );
}

export { getOptions, getESLintOptions };
