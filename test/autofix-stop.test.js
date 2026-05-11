import { join } from 'path';

import { copySync, removeSync } from 'fs-extra';
import chokidar from 'chokidar';

import pack from './utils/pack.js';

describe('autofix stop', () => {
  const entry = join(import.meta.dirname, 'fixtures/nonfixable-clone.js');

  let changed = false;
  let watcher;

  beforeAll(() => {
    copySync(join(import.meta.dirname, 'fixtures/nonfixable.js'), entry);

    watcher = chokidar.watch(entry);
    watcher.on('change', () => {
      changed = true;
    });
  });

  afterAll(() => {
    watcher.close();
    removeSync(entry);
  });

  it('should not change file if there are no fixable errors/warnings', async () => {
    const compiler = pack('nonfixable-clone', { fix: true });

    await compiler.runAsync();
    expect(changed).toBe(false);
  });
});
