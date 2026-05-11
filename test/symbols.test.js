import { join } from 'path';
import { rs } from '@rstest/core';

import pack from './utils/pack';

describe('symbols', () => {
  afterEach(() => {
    rs.restoreAllMocks();
  });

  it('should return error', async () => {
    const compiler = pack(
      'symbols',
      {},
      { context: join(__dirname, 'fixtures/[symbols]') },
    );

    const stats = await compiler.runAsync();
    expect(stats.hasWarnings()).toBe(false);
    expect(stats.hasErrors()).toBe(true);
  });
});
