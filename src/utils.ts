import { statSync } from 'node:fs';
import { resolve } from 'node:path';

import normalizePath from 'normalize-path';

type Arrify<T> = T extends null | undefined
  ? []
  : T extends string
    ? [string]
    : T extends readonly unknown[]
      ? T
      : T extends Iterable<infer Item>
        ? Item[]
        : [T];

/* istanbul ignore next */
function arrify<T>(value: T): Arrify<T> {
  if (value === null || value === undefined) {
    return [] as Arrify<T>;
  }

  if (Array.isArray(value)) {
    return value as Arrify<T>;
  }

  if (typeof value === 'string') {
    return [value] as Arrify<T>;
  }

  const iterable = value as unknown as Iterable<unknown>;
  if (typeof iterable[Symbol.iterator] === 'function') {
    return [...iterable] as Arrify<T>;
  }

  return [value] as Arrify<T>;
}

function parseFiles(files: string | string[], context: string): string[] {
  return arrify(files).map((file) => normalizePath(resolve(context, file)));
}

function parseFoldersToGlobs(
  patterns: string | string[],
  extensions: string | string[] = [],
): string[] {
  const extensionsList = arrify(extensions);
  const [prefix, postfix] = extensionsList.length > 1 ? ['{', '}'] : ['', ''];
  const extensionsGlob = extensionsList
    .map((extension) => extension.replace(/^\./u, ''))
    .join(',');

  return arrify(patterns).map((pattern) => {
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

export { arrify, parseFiles, parseFoldersToGlobs };
