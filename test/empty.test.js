import { join } from 'path';
import { rspack } from '@rspack/core';
import ESLintPlugin from '../src';

describe('empty', () => {
  it('no error when no files matching', () =>
    new Promise((resolve, reject) => {
      const compiler = rspack({
        context: join(__dirname, 'fixtures', 'empty'),
        mode: 'development',
        entry: '../',
        plugins: [new ESLintPlugin()],
      });

      compiler.run((err, stats) => {
        try {
          expect(err).toBeNull();
          expect(stats.hasWarnings()).toBe(false);
          expect(stats.hasErrors()).toBe(false);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }));
});
