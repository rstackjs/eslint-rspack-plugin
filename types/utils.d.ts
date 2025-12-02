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
export function arrify<T>(
  value: T,
): T extends null | undefined
  ? []
  : T extends string
    ? [string]
    : T extends readonly unknown[]
      ? T
      : T extends Iterable<infer T_1>
        ? T_1[]
        : [T];
/**
 * @param {string|string[]} files
 * @param {string} context
 * @returns {string[]}
 */
export function parseFiles(files: string | string[], context: string): string[];
/**
 * @param {string|string[]} patterns
 * @param {string|string[]} extensions
 * @returns {string[]}
 */
export function parseFoldersToGlobs(
  patterns: string | string[],
  extensions?: string | string[],
): string[];
/**
 * @param {string} _ key, but unused
 * @param {any} value
 */
export function jsonStringifyReplacerSortKeys(_: string, value: any): any;
/**
 * Recursively find all files matching the wanted patterns and not matching exclude patterns
 * @param {string[]} wanted - Glob patterns for files to include
 * @param {string[]} exclude - Glob patterns for files to exclude
 * @param {string} baseDir - Base directory to start searching from
 * @returns {string[]} Array of absolute file paths
 */
export function findAllMatchingFiles(
  wanted: string[],
  exclude: string[],
  baseDir: string,
): string[];
