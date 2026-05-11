import { stringify } from 'flatted';
import { rs } from '@rstest/core';

import {
  jsonStringifyReplacerSortKeys,
  parseFoldersToGlobs,
  parseFiles,
} from '../src/utils';

rs.mockRequire('fs', () => {
  return {
    statSync(pattern) {
      return {
        isDirectory() {
          return pattern.indexOf('/path/') === 0;
        },
      };
    },
  };
});

test('parseFiles should return relative files from context', () => {
  expect(
    parseFiles(
      ['**/*', '../package-a/src/**/', '../package-b/src/**/'],
      'main/src',
    ),
  ).toEqual(
    expect.arrayContaining([
      expect.stringContaining('main/src/**/*'),
      expect.stringContaining('main/package-a/src/**'),
      expect.stringContaining('main/package-b/src/**'),
    ]),
  );
});

test('parseFoldersToGlobs should return globs for folders', () => {
  const withoutSlash = '/path/to/code';
  const withSlash = `${withoutSlash}/`;

  expect(parseFoldersToGlobs(withoutSlash, 'js')).toMatchInlineSnapshot(`
    [
      "/path/to/code/**/*.js",
    ]
  `);
  expect(parseFoldersToGlobs(withSlash, 'js')).toMatchInlineSnapshot(`
    [
      "/path/to/code/**/*.js",
    ]
  `);

  expect(
    parseFoldersToGlobs(
      [withoutSlash, withSlash, '/some/file.js'],
      ['js', 'cjs', 'mjs'],
    ),
  ).toMatchInlineSnapshot(`
    [
      "/path/to/code/**/*.{js,cjs,mjs}",
      "/path/to/code/**/*.{js,cjs,mjs}",
      "/some/file.js",
    ]
  `);

  expect(parseFoldersToGlobs(withoutSlash)).toMatchInlineSnapshot(`
    [
      "/path/to/code/**",
    ]
  `);

  expect(parseFoldersToGlobs(withSlash)).toMatchInlineSnapshot(`
    [
      "/path/to/code/**",
    ]
  `);
});

test('parseFoldersToGlobs should return unmodified globs for globs (ignoring extensions)', () => {
  expect(parseFoldersToGlobs('**.notjs', 'js')).toMatchInlineSnapshot(`
    [
      "**.notjs",
    ]
  `);
});

test('jsonStringifyReplacerSortKeys should support circular objects with flatted', () => {
  const plugin = {
    configs: {},
    processors: {},
    rules: {},
  };

  Object.assign(plugin.configs, {
    recommended: {
      plugins: {
        self: plugin,
      },
      rules: {},
    },
  });

  const cacheKey = stringify(
    {
      key: 'test',
      options: {
        overrideConfig: {
          plugins: {
            plugin,
          },
        },
      },
    },
    jsonStringifyReplacerSortKeys,
  );

  expect(cacheKey).toContain('"self"');
});
