# eslint-rspack-plugin Migration Guide (v4 -> v5)

This guide covers breaking changes you need to handle when upgrading `eslint-rspack-plugin` from v4 to v5.

## Breaking Changes

### Drop ESLint 8 Support

ESLint 8 is no longer supported in v5.

The supported ESLint peer dependency range is now `^9.0.0 || ^10.0.0`.

### Drop Node 18 Support

Node.js 18 is no longer supported in v5.

The minimum supported Node.js version is now `>=20.19.0`.

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

### `failOnError` Follows Compiler Mode

In v4, `failOnError` defaulted to `true`. In v5, it defaults to `false` when [mode](https://rspack.rs/config/mode) is `development`, and `true` otherwise.

Set `failOnError: true` explicitly if development builds should still fail on ESLint errors.
