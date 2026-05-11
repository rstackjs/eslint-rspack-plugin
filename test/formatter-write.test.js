import { join } from 'path';
import { readFileSync, removeSync } from 'fs-extra';
import { rspack } from '@rspack/core';
import conf from './utils/conf.js';
import { stripVTControlCharacters } from 'node:util';

const cleanContents = (contents) =>
  stripVTControlCharacters(contents.split('error.js')[1])
    .replace(/\r\n/g, '\n')
    .replace(/\\r\\n/g, '\\n');

describe('formatter write', () => {
  it('should write results to relative file with a custom formatter', () =>
    new Promise((resolve, reject) => {
      const outputFilename = 'outputReport-relative.txt';
      const config = conf('error', {
        formatter: 'json',
        outputReport: {
          formatter: 'json',
          filePath: outputFilename,
        },
      });

      const outputFilepath = join(config.output.path, outputFilename);
      removeSync(outputFilepath);

      const compiler = rspack(config);
      compiler.run((err, stats) => {
        try {
          const contents = readFileSync(outputFilepath, 'utf8');

          expect(err).toBeNull();
          expect(stats.hasWarnings()).toBe(false);
          expect(stats.hasErrors()).toBe(true);
          expect(stats.compilation.errors[0].message).toContain(`× [eslint]`);
          expect(cleanContents(contents)).toMatchSnapshot();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }));

  it('should write results to absolute file with a same formatter', () =>
    new Promise((resolve, reject) => {
      const outputFilename = 'outputReport-absolute.txt';
      const outputFilepath = join(
        import.meta.dirname,
        'output',
        outputFilename,
      );
      const config = conf('error', {
        outputReport: {
          filePath: outputFilepath,
        },
      });

      removeSync(outputFilepath);

      const compiler = rspack(config);
      compiler.run((err, stats) => {
        try {
          const contents = readFileSync(outputFilepath, 'utf8');

          expect(err).toBeNull();
          expect(stats.hasWarnings()).toBe(false);
          expect(stats.hasErrors()).toBe(true);
          expect(stats.compilation.errors[0].message).toContain(`× [eslint]`);
          expect(cleanContents(contents)).toMatchSnapshot();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }));
});
