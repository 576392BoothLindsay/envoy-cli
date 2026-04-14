import {
  sortKeys,
  sortByPrefix,
  sortEnv,
  formatSortResult,
} from './envSorter';

const sampleEnv: Record<string, string> = {
  DB_HOST: 'localhost',
  APP_NAME: 'envoy',
  DB_PORT: '5432',
  APP_ENV: 'production',
  NODE_ENV: 'production',
  ZEBRA: 'last',
};

describe('sortKeys', () => {
  it('sorts keys ascending by default', () => {
    const keys = sortKeys(sampleEnv);
    expect(keys).toEqual([
      'APP_ENV',
      'APP_NAME',
      'DB_HOST',
      'DB_PORT',
      'NODE_ENV',
      'ZEBRA',
    ]);
  });

  it('sorts keys descending', () => {
    const keys = sortKeys(sampleEnv, 'desc');
    expect(keys[0]).toBe('ZEBRA');
    expect(keys[keys.length - 1]).toBe('APP_ENV');
  });
});

describe('sortByPrefix', () => {
  it('groups and sorts by prefix', () => {
    const keys = sortByPrefix(sampleEnv);
    // APP_ group first, then DB_, then NODE_, then ZEBRA (no underscore prefix)
    expect(keys.indexOf('APP_ENV')).toBeLessThan(keys.indexOf('DB_HOST'));
    expect(keys.indexOf('DB_HOST')).toBeLessThan(keys.indexOf('NODE_ENV'));
  });

  it('places keys without prefix at the end', () => {
    const env = { B_KEY: '1', A_KEY: '2', NOPREFIX: '3' };
    const keys = sortByPrefix(env);
    expect(keys[keys.length - 1]).toBe('NOPREFIX');
  });
});

describe('sortEnv', () => {
  it('returns a sorted record', () => {
    const result = sortEnv(sampleEnv);
    const keys = Object.keys(result.sorted);
    expect(keys).toEqual([...keys].sort());
  });

  it('respects groupByPrefix option', () => {
    const result = sortEnv(sampleEnv, { groupByPrefix: true });
    expect(result.sorted).toBeDefined();
    expect(result.keyCount).toBe(6);
  });

  it('includes metadata in result', () => {
    const result = sortEnv(sampleEnv, { order: 'desc' });
    expect(result.order).toBe('desc');
    expect(result.keyCount).toBe(6);
    expect(result.original).toBe(sampleEnv);
  });
});

describe('formatSortResult', () => {
  it('formats result as readable string', () => {
    const result = sortEnv({ B: '2', A: '1' });
    const output = formatSortResult(result);
    expect(output).toContain('Sorted 2 key(s)');
    expect(output).toContain('ascending');
    expect(output).toContain('A=1');
    expect(output).toContain('B=2');
  });
});
