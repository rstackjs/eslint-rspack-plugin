import { join } from 'path';
import { removeSync } from 'fs-extra';
import { rspack } from '@rspack/core';
import conf from './utils/conf';

describe('error (cached module)', () => {
  const cacheLocation = join(__dirname, 'cache');

  beforeEach(() => {
    removeSync(cacheLocation);
  });

  afterAll(() => {
    removeSync(cacheLocation);
  });

  it('should return error even if module is cached', () =>
    new Promise((resolve, reject) => {
      const config = conf('error');
      config.cache = {
        type: 'filesystem',
        idleTimeout: 0,
        idleTimeoutAfterLargeChanges: 0,
        idleTimeoutForInitialStore: 0,
        cacheLocation,
      };

      const c1 = rspack(config);

      c1.run((err1, stats1) => {
        try {
          expect(err1).toBeNull();
          expect(stats1.hasWarnings()).toBe(false);
          expect(stats1.hasErrors()).toBe(true);
        } catch (error) {
          reject(error);
          return;
        }

        c1.close(() => {
          const c2 = rspack(config);
          c2.run((err2, stats2) => {
            try {
              expect(err2).toBeNull();
              expect(stats2.hasWarnings()).toBe(false);
              expect(stats2.hasErrors()).toBe(true);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        });
      });
    }));
});
