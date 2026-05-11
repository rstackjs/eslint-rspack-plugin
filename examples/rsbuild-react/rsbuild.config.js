// @ts-check
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import ESLintPlugin from 'eslint-rspack-plugin';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: (_config, { appendPlugins }) => {
      appendPlugins(
        new ESLintPlugin({
          files: 'src/**/*.{js,jsx}',
        }),
      );
    },
  },
});
