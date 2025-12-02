const { resolve, join } = require('path');
const { statSync, readdirSync, existsSync } = require('fs');

const normalizePath = require('normalize-path');
const { isMatch } = require('micromatch');

/**
 * @template T
 * @param {T} value
 * @return {
   T extends (null | undefined)
     ? []
     : T extends string
       ? [string]
       : T extends readonly unknown[]
         ? T
         : T extends Iterable<infer T>
           ? T[]
           : [T]
 }
 */
/* istanbul ignore next */
function arrify(value) {
  // eslint-disable-next-line no-undefined
  if (value === null || value === undefined) {
    // @ts-ignore
    return [];
  }

  if (Array.isArray(value)) {
    // @ts-ignore
    return value;
  }

  if (typeof value === 'string') {
    // @ts-ignore
    return [value];
  }

  // @ts-ignore
  if (typeof value[Symbol.iterator] === 'function') {
    // @ts-ignore
    return [...value];
  }

  // @ts-ignore
  return [value];
}

/**
 * @param {string|string[]} files
 * @param {string} context
 * @returns {string[]}
 */
function parseFiles(files, context) {
  return arrify(files).map((/** @type {string} */ file) =>
    normalizePath(resolve(context, file)),
  );
}

/**
 * @param {string|string[]} patterns
 * @param {string|string[]} extensions
 * @returns {string[]}
 */
function parseFoldersToGlobs(patterns, extensions = []) {
  const extensionsList = arrify(extensions);
  const [prefix, postfix] = extensionsList.length > 1 ? ['{', '}'] : ['', ''];
  const extensionsGlob = extensionsList
    .map((/** @type {string} */ extension) => extension.replace(/^\./u, ''))
    .join(',');

  return arrify(patterns).map((/** @type {string} */ pattern) => {
    try {
      // The patterns are absolute because they are prepended with the context.
      const stats = statSync(pattern);
      /* istanbul ignore else */
      if (stats.isDirectory()) {
        return pattern.replace(
          /[/\\]*?$/u,
          `/**${
            extensionsGlob ? `/*.${prefix + extensionsGlob + postfix}` : ''
          }`,
        );
      }
    } catch (_) {
      // Return the pattern as is on error.
    }
    return pattern;
  });
}

/**
 * @param {string} _ key, but unused
 * @param {any} value
 */
const jsonStringifyReplacerSortKeys = (_, value) => {
  /**
   * @param {{ [x: string]: any; }} sorted
   * @param {string | number} key
   */
  const insert = (sorted, key) => {
    // eslint-disable-next-line no-param-reassign
    sorted[key] = value[key];
    return sorted;
  };

  return value instanceof Object && !(value instanceof Array)
    ? Object.keys(value).sort().reduce(insert, {})
    : value;
};

/**
 * Recursively find all files matching the wanted patterns and not matching exclude patterns
 * @param {string[]} wanted - Glob patterns for files to include
 * @param {string[]} exclude - Glob patterns for files to exclude
 * @param {string} baseDir - Base directory to start searching from
 * @returns {string[]} Array of absolute file paths
 */
function findAllMatchingFiles(wanted, exclude, baseDir) {
  /** @type {string[]} */
  const files = [];

  /**
   * @param {string} dir
   */
  function walkDirectory(dir) {
    if (!existsSync(dir)) {
      return;
    }

    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      return;
    }

    for (const entry of entries) {
      const fullPath = normalizePath(join(dir, entry.name));

      if (!isMatch(fullPath, exclude, { dot: true })) {
        if (entry.isDirectory()) {
          walkDirectory(fullPath);
        } else if (entry.isFile()) {
          if (isMatch(fullPath, wanted, { dot: true })) {
            files.push(fullPath);
          }
        }
      }
    }
  }

  walkDirectory(baseDir);
  return files;
}

module.exports = {
  arrify,
  parseFiles,
  parseFoldersToGlobs,
  jsonStringifyReplacerSortKeys,
  findAllMatchingFiles,
};
