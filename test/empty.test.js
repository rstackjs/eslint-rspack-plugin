import { join } from 'path';
import { rspack } from '@rspack/core';
import ESLintPlugin from '../src';

describe('empty', () => {
  it('no error when no files matching', (done) => {
    const compiler = rspack({
      context: join(__dirname, 'fixtures', 'empty'),
      mode: 'development',
      entry: '../',
      plugins: [new ESLintPlugin()],
    });

    compiler.run((err, stats) => {
      expect(stats.hasWarnings()).toBe(false);
      expect(stats.hasErrors()).toBe(false);
      done();
    });
  });
});
