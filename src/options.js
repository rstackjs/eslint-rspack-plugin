import schema from './options.json' with { type: 'json' };

/** @typedef {import("eslint").ESLint.Options} ESLintOptions */
/** @typedef {import('eslint').ESLint.LintResult} LintResult */
/** @typedef {import('eslint').ESLint.LintResultData} LintResultData */

/**
 * @callback FormatterFunction
 * @param {LintResult[]} results
 * @param {LintResultData=} data
 * @returns {string}
 */

/**
 * @typedef {Object} OutputReport
 * @property {string=} filePath
 * @property {string|FormatterFunction=} formatter
 */

/** @typedef {'error' | 'warning' | 'off'} Severity */

/**
 * @typedef {Object} SeverityOptions
 * @property {Severity=} error
 * @property {Severity=} warning
 */

/**
 * @typedef {Object} PluginOptions
 * @property {string=} context
 * @property {string=} eslintPath
 * @property {string|string[]=} exclude
 * @property {string|string[]=} extensions
 * @property {string|string[]=} files
 * @property {boolean=} fix
 * @property {string|FormatterFunction=} formatter
 * @property {boolean=} lintDirtyModulesOnly
 * @property {boolean=} lintAllFiles
 * @property {SeverityOptions=} severity
 * @property {OutputReport=} outputReport
 * @property {RegExp|RegExp[]=} resourceQueryExclude
 * @property {string=} configType
 */

/** @typedef {PluginOptions & ESLintOptions} Options */

/**
 * @param {Options} pluginOptions
 * @returns {PluginOptions}
 */
function getOptions(pluginOptions) {
  /** @type {{error: Severity, warning: Severity}} */
  const defaultSeverity = {
    error: 'error',
    warning: 'warning',
  };
  /** @type {{error: Severity, warning: Severity}} */
  const severity = {
    ...defaultSeverity,
    ...pluginOptions.severity,
  };

  const options = {
    cache: true,
    cacheLocation: 'node_modules/.cache/eslint-rspack-plugin/.eslintcache',
    configType: 'flat',
    extensions: 'js',
    resourceQueryExclude: [],
    ...pluginOptions,
    severity,
  };

  return options;
}

/**
 * @param {Options} loaderOptions
 * @returns {ESLintOptions}
 */
function getESLintOptions(loaderOptions) {
  const eslintOptions = { ...loaderOptions };

  // Keep the fix option because it is common to both the loader and ESLint.
  const { fix, extensions, ...eslintOnlyOptions } = schema.properties;

  // No need to guard the for-in because schema.properties has hardcoded keys.
  for (const option in eslintOnlyOptions) {
    // @ts-ignore
    delete eslintOptions[option];
  }

  // Some options aren't available in flat mode
  if (loaderOptions.configType === 'flat') {
    delete eslintOptions.extensions;
  }

  return eslintOptions;
}

export { getOptions, getESLintOptions };
