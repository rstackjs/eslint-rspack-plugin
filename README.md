# eslint-rspack-plugin

<p>
  <a href="https://npmjs.com/package/eslint-rspack-plugin">
   <img src="https://img.shields.io/npm/v/eslint-rspack-plugin?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/eslint-rspack-plugin?minimal=true"><img src="https://img.shields.io/npm/dm/eslint-rspack-plugin.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

This plugin runs [ESLint](https://eslint.org/) during Rspack compilation to detect issues in your JavaScript code. In watch mode, it re-runs ESLint on files changed by Rspack.

> You may find it more efficient to avoid using the `eslint-rspack-plugin`, as running ESLint during the build can lead to longer build times. A separate lint command usually offers a better workflow.

## Versions

- 5.x: Supports ESLint 9/10, see [v4 -> v5](https://github.com/rstackjs/eslint-rspack-plugin/blob/master/docs/migrate-v4-to-v5.md) for migration guide.
- 4.x: Supports ESLint 8/9/10, see [4.x README](https://github.com/rstackjs/eslint-rspack-plugin/tree/v4.x#eslint-rspack-plugin) for usage guide.

## Getting Started

To begin, you'll need to install `eslint-rspack-plugin`:

```bash
# pnpm
pnpm add -D eslint-rspack-plugin

# npm
npm install -D eslint-rspack-plugin

# yarn
yarn add -D eslint-rspack-plugin

# bun
bun add -D eslint-rspack-plugin
```

You also need to install `eslint >= 9`, if you haven't already:

```bash
# pnpm
pnpm add -D eslint

# npm
npm install -D eslint

# yarn
yarn add -D eslint

# bun
bun add -D eslint
```

Then add the plugin to your Rspack config. For example:

```js
import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [new ESLintPlugin()],
};
```

## Options

You can pass [ESLint options](https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions).

> [!NOTE]
>
> The config option you provide will be passed to the `ESLint` class.
> This is a different set of options than what you'd specify in `package.json` or `eslint.config.js`.
> See the [ESLint docs](https://eslint.org/docs/latest/integrate/nodejs-api#-new-eslintoptions) for more details.

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

- Default: `flat`

Specify the type of configuration to use with ESLint.

- `flat` is the current standard configuration format.
- `eslintrc` is the legacy configuration format and has been officially deprecated.

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

Will enable [ESLint autofix feature](https://eslint.org/docs/latest/integrate/nodejs-api#-eslintoutputfixesresults).

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

Accepts a function that will have one argument: an array of eslint messages (object). The function must return the output as a string. You can use official [eslint formatters](https://eslint.org/docs/latest/use/formatters/).

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

### `severity`

- Type:

```ts
type severity = {
  error?: 'error' | 'warning' | 'off';
  warning?: 'error' | 'warning' | 'off';
};
```

- Default:

```js
{
  error: 'error',
  warning: 'warning',
}
```

Controls how ESLint diagnostics are emitted to Rspack.

Diagnostics emitted as `compilation.errors` are treated as build errors by
Rspack and make the build fail. Diagnostics emitted as `compilation.warnings`
are printed as warnings and do not fail the build.

- `error: 'error'`: emit ESLint errors as `compilation.errors`.
- `error: 'warning'`: emit ESLint errors as `compilation.warnings`.
- `error: 'off'`: do not emit ESLint errors.
- `warning: 'warning'`: emit ESLint warnings as `compilation.warnings`.
- `warning: 'error'`: emit ESLint warnings as `compilation.errors`.
- `warning: 'off'`: do not emit ESLint warnings.

Examples:

Use the default behavior:

```js
new ESLintPlugin({
  severity: {
    error: 'error',
    warning: 'warning',
  },
});
```

Downgrade ESLint errors so they are still shown but do not fail the build:

```js
new ESLintPlugin({
  severity: {
    error: 'warning',
  },
});
```

Treat ESLint warnings as build errors:

```js
new ESLintPlugin({
  severity: {
    warning: 'error',
  },
});
```

Ignore ESLint warnings:

```js
new ESLintPlugin({
  severity: {
    warning: 'off',
  },
});
```

Ignore ESLint errors:

```js
new ESLintPlugin({
  severity: {
    error: 'off',
  },
});
```

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

## Credits

This plugin was forked from the excellent [eslint-webpack-plugin](https://github.com/webpack/eslint-webpack-plugin/). Many thanks to the original authors for their great work.

## License

[MIT](./LICENSE)

[npm]: https://img.shields.io/npm/v/eslint-rspack-plugin.svg
[npm-url]: https://npmjs.com/package/eslint-rspack-plugin
[node]: https://img.shields.io/node/v/eslint-rspack-plugin.svg
[node-url]: https://nodejs.org
