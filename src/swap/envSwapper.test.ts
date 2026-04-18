import { swapValues, swapMultiple, formatSwapResult } from './envSwapper';

const baseEnv = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  CACHE_HOST: 'redis',
  CACHE_PORT: '6379',
};

describe('swapValues', () => {
  it('swaps values of two keys', () => {
    const result = swapValues(baseEnv, 'DB_HOST', 'CACHE_HOST');
    expect(result['DB_HOST']).toBe('redis');
    expect(result['CACHE_HOST']).toBe('localhost');
  });

  it('does not mutate original', () => {
    swapValues(baseEnv, 'DB_HOST', 'CACHE_HOST');
    expect(baseEnv['DB_HOST']).toBe('localhost');
  });

  it('throws if a key does not exist', () => {
    expect(() => swapValues(baseEnv, 'DB_HOST', 'MISSING')).toThrow();
  });
});

describe('swapMultiple', () => {
  it('swaps multiple pairs', () => {
    const result = swapMultiple(baseEnv, [
      ['DB_HOST', 'CACHE_HOST'],
      ['DB_PORT', 'CACHE_PORT'],
    ]);
    expect(result.swapped['DB_HOST']).toBe('redis');
    expect(result.swapped['CACHE_HOST']).toBe('localhost');
    expect(result.swapped['DB_PORT']).toBe('6379');
    expect(result.swapped['CACHE_PORT']).toBe('5432');
    expect(result.pairs).toHaveLength(2);
  });

  it('skips pairs with missing keys', () => {
    const result = swapMultiple(baseEnv, [['DB_HOST', 'MISSING']]);
    expect(result.pairs).toHaveLength(0);
    expect(result.swapped['DB_HOST']).toBe('localhost');
  });

  it('tracks unchanged keys', () => {
    const result = swapMultiple(baseEnv, [['DB_HOST', 'CACHE_HOST']]);
    expect(result.unchanged['DB_PORT']).toBe('5432');
    expect(result.unchanged['DB_HOST']).toBeUndefined();
  });
});

describe('formatSwapResult', () => {
  it('formats swap result with pairs', () => {
    const result = swapMultiple(baseEnv, [['DB_HOST', 'CACHE_HOST']]);
    const output = formatSwapResult(result);
    expect(output).toContain('DB_HOST <-> CACHE_HOST');
    expect(output).toContain('1 pair(s)');
  });

  it('shows message when nothing swapped', () => {
    const result = swapMultiple(baseEnv, [['DB_HOST', 'MISSING']]);
    expect(formatSwapResult(result)).toContain('No keys were swapped.');
  });
});
