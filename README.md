# eslint-rspack-plugin

<p>
  <a href="https://npmjs.com/package/eslint-rspack-plugin">
   <img src="https://img.shields.io/npm/v/eslint-rspack-plugin?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/eslint-rspack-plugin?minimal=true"><img src="https://img.shields.io/npm/dm/eslint-rspack-plugin.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

> This plugin was forked from the excellent [eslint-webpack-plugin](https://github.com/webpack/eslint-webpack-plugin/). Many thanks to the original authors for their great work.

This plugin uses [ESLint](https://eslint.org/) to find and fix problems in your JavaScript code.

> You may find it more efficient to avoid using the `eslint-rspack-plugin`, as running ESLint during the build can lead to longer build times. A separate lint command usually offers a better workflow.

## Getting Started

To begin, you'll need to install `eslint-rspack-plugin`:

```bash
npm install eslint-rspack-plugin --save-dev
```

or

```bash
yarn add -D eslint-rspack-plugin
```

or

```bash
pnpm add -D eslint-rspack-plugin
```

> [!NOTE]
>
> You also need to install `eslint >= 8` from npm, if you haven't already:

```bash
npm install eslint --save-dev
```

or

```bash
yarn add -D eslint
```

or

```bash
pnpm add -D eslint
```

Then add the plugin to your Rspack config. For example:

```js
import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [new ESLintPlugin()],
};
```

When using ESLint flat config, set the `configType` option to `flat`:

```js
import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [
    new ESLintPlugin({
      configType: 'flat',
    }),
  ],
};
```

## Options

You can pass [ESLint options](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions).

> [!NOTE]
>
> The config option you provide will be passed to the `ESLint` class.
> This is a different set of options than what you'd specify in `package.json` or `.eslintrc`.
> See the [ESLint docs](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions) for more details.

### `cache`

- Type:

```ts
type cache = boolean;
```

- Default: `true`

The cache is enabled by default to decrease execution time.

### `cacheLocation`

- Type:

```ts
type cacheLocation = string;
```

- Default: `node_modules/.cache/eslint-rspack-plugin/.eslintcache`

Specify the path to the cache location. Can be a file or a directory.

### `configType`

- Type:

```ts
type configType = 'flat' | 'eslintrc';
```

- Default: `eslintrc`

Specify the type of configuration to use with ESLint.

- `eslintrc` is the classic configuration format available in most ESLint versions.
- `flat` is the new format introduced in ESLint 8.21.0.

The flat configuration format is explained in its [own documentation](https://eslint.org/docs/latest/use/configure/configuration-files).

### `context`

- Type:

```ts
type context = string;
```

- Default: `compiler.context`

A string indicating the root of your files.

### `eslintPath`

- Type:

```ts
type eslintPath = string;
```

- Default: `eslint`

Path to `eslint` instance that will be used for linting. If the `eslintPath` is a folder like a official eslint, or specify a `formatter` option. now you don't have to install `eslint`.

### `extensions`

- Type:

```ts
type extensions = string | Array<string>;
```

- Default: `'js'`

Specify extensions that should be checked.

Only works when `configType` is `eslintrc`. For flat config, use `files` option instead.

### `exclude`

- Type:

```ts
type exclude = string | Array<string>;
```

- Default: `'node_modules'`

Specify the files and/or directories to exclude. Must be relative to `options.context`.

### `resourceQueryExclude`

- Type:

```ts
type resourceQueryExclude = RegExp | Array<RegExp>;
```

- Default: `[]`

Specify the resource query to exclude.

### `files`

- Type:

```ts
type files = string | Array<string>;
```

- Default: `null`

Specify directories, files, or globs. Must be relative to `options.context`.
Directories are traversed recursively looking for files matching `options.extensions`.
File and glob patterns ignore `options.extensions`.

### `fix`

- Type:

```ts
type fix = boolean;
```

- Default: `false`

Will enable [ESLint autofix feature](https://eslint.org/docs/developer-guide/nodejs-api#-eslintoutputfixesresults).

**Be careful: this option will change source files.**

### `formatter`

- Type:

```ts
type formatter = string| (
  results:  Array<import('eslint').ESLint.LintResult>,
  data?: import('eslint').ESLint.LintResultData | undefined
) => string
```

- Default: `'stylish'`

Accepts a function that will have one argument: an array of eslint messages (object). The function must return the output as a string. You can use official [eslint formatters](https://eslint.org/docs/user-guide/formatters/).

### `lintDirtyModulesOnly`

- Type:

```ts
type lintDirtyModulesOnly = boolean;
```

- Default: `false`

Lint only changed files, skip lint on start.

### `lintAllFiles`

- Type:

```ts
type lintAllFiles = boolean;
```

- Default: `false`

Lint all files matching the `files` and `extensions` patterns, regardless of whether they are part of the compilation.

> [!TIP]
> This option is particularly useful for multi-environment builds (e.g., Rsbuild/Rspack with separate client and server environments) where you want to ensure all files in your codebase are linted, not just the ones included in each environment's dependency graph.
>
> Enabling this option will run a single ESLint instance to check all files rather than running separate ESLint instances for each environment.

### `threads`

- Type:

```ts
type threads = boolean | number;
```

- Default: `false`

Will run lint tasks across a thread pool. The pool size is automatic unless you specify a number.

### Errors and Warning

**By default the plugin will auto adjust error reporting depending on eslint errors/warnings counts.**
You can still force this behavior by using `emitError` **or** `emitWarning` options:

#### `emitError`

- Type:

```ts
type emitError = boolean;
```

- Default: `true`

The errors found will always be emitted, to disable set to `false`.

#### `emitWarning`

- Type:

```ts
type emitWarning = boolean;
```

- Default: `true`

The warnings found will always be emitted, to disable set to `false`.

#### `failOnError`

- Type:

```ts
type failOnError = boolean;
```

- Default: `true`

Will cause the module build to fail if there are any errors, to disable set to `false`.

#### `failOnWarning`

- Type:

```ts
type failOnWarning = boolean;
```

- Default: `false`

Will cause the module build to fail if there are any warnings, if set to `true`.

#### `quiet`

- Type:

```ts
type quiet = boolean;
```

- Default: `false`

Will process and report errors only and ignore warnings, if set to `true`.

#### `outputReport`

- Type:

```ts
type outputReport =
  | boolean
  | {
      filePath?: string | undefined;
      formatter?:
        | (
            | string
            | ((
                results: Array<import('eslint').ESLint.LintResult>,
                data?: import('eslint').ESLint.LintResultData | undefined,
              ) => string)
          )
        | undefined;
    };
```

- Default: `false`

Write the output of the errors to a file, for example a checkstyle xml file for use for reporting on Jenkins CI.

The `filePath` is an absolute path or relative to the Rspack config: `output.path`.
You can pass in a different `formatter` for the output file,
if none is passed in the default/configured formatter will be used.

## Changelog

[Changelog](CHANGELOG.md)

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/eslint-rspack-plugin.svg
[npm-url]: https://npmjs.com/package/eslint-rspack-plugin
[node]: https://img.shields.io/node/v/eslint-rspack-plugin.svg
[node-url]: https://nodejs.org
