# eslint-rspack-plugin Migration Guide (v4 -> v5)

This guide covers breaking changes you need to handle when upgrading `eslint-rspack-plugin` from v4 to v5.

## Breaking Changes

### Drop ESLint 8 Support

ESLint 8 is no longer supported in v5.

The supported ESLint peer dependency range is now `^9.0.0 || ^10.0.0`.

### Drop Node 18 Support

Node.js 18 is no longer supported in v5.

The minimum supported Node.js version is now `>=20.19.0`.

### Native ESM Package

`eslint-rspack-plugin` is now published as a native ES module package. Use ESM syntax when importing it from your Rspack config:

```diff
- const ESLintPlugin = require('eslint-rspack-plugin');
+ import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [new ESLintPlugin()],
};
```

If your Rspack config is still CommonJS, migrate it to ESM first by using `export default` and either a `.mjs` config file or a `.js` config file in a package with `"type": "module"`.

### Flat Config is the Default

In v4, `eslint-rspack-plugin` used `eslintrc` by default for ESLint 8 and ESLint 9. In v5, the default `configType` is `flat`.

If your project already uses `eslint.config.js`, you can usually remove any explicit `configType: 'flat'` option:

```diff
import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [
    new ESLintPlugin({
-     configType: 'flat',
    }),
  ],
};
```

If your project still uses `.eslintrc`, either migrate to flat config or explicitly keep legacy config mode:

```diff
import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [
    new ESLintPlugin({
+     configType: 'eslintrc',
    }),
  ],
};
```

`eslintrc` is deprecated by ESLint, so flat config is the recommended migration target.

### Remove `threads`

The plugin-specific `threads` option was removed in v5. The plugin no longer creates its own worker pool, and there is no replacement plugin option.

If you use ESLint 9.34.0 or later and still want parallel linting, pass ESLint's native `concurrency` Node.js API option through the plugin options:

```diff
import ESLintPlugin from 'eslint-rspack-plugin';

export default {
  plugins: [
    new ESLintPlugin({
-     threads: true,
+     concurrency: 'auto',
    }),
  ],
};
```

Use a number for an explicit worker count. If you use ESLint 9.0-9.33, or if you previously used `threads: false`, remove the `threads` option instead. ESLint's default `concurrency` value is `'off'`.

When you enable `concurrency`, ESLint options must support structured cloning. If you pass functions or complex plugin objects through ESLint options, leave `concurrency` off or move that configuration into your ESLint config file.

### `severity` Replaces Emit and Fail Options

The `emitError`, `emitWarning`, `failOnError`, `failOnWarning`, and `quiet`
options were removed. Use the new `severity` option to choose how ESLint
diagnostics are emitted to Rspack.

By default, ESLint errors are emitted as Rspack errors and ESLint warnings are
emitted as Rspack warnings:

```js
new ESLintPlugin({
  severity: {
    error: 'error',
    warning: 'warning',
  },
});
```

#### `emitError: false`

Use `severity.error: 'off'` to hide ESLint errors:

```js
// v4
new ESLintPlugin({ emitError: false });

// v5
new ESLintPlugin({ severity: { error: 'off' } });
```

#### `emitWarning: false`

Use `severity.warning: 'off'` to hide ESLint warnings:

```js
// v4
new ESLintPlugin({ emitWarning: false });

// v5
new ESLintPlugin({ severity: { warning: 'off' } });
```

#### `quiet: true`

Use `severity.warning: 'off'` to keep ESLint errors and hide ESLint warnings:

```js
// v4
new ESLintPlugin({ quiet: true });

// v5
new ESLintPlugin({ severity: { warning: 'off' } });
```

#### `failOnWarning: true`

Use `severity.warning: 'error'` to emit ESLint warnings as Rspack errors:

```js
// v4
new ESLintPlugin({ failOnWarning: true });

// v5
new ESLintPlugin({ severity: { warning: 'error' } });
```

#### `failOnError`

There is no direct `failOnError` replacement. ESLint errors are emitted as
Rspack errors by default, so they fail production builds without an extra plugin
option.

If you want to keep ESLint error output visible without failing the build, emit
ESLint errors as Rspack warnings instead:

```js
new ESLintPlugin({
  severity: {
    error: 'warning',
  },
});
```
