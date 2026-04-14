import { sortEnv, formatSortResult } from './envSorter';

const sampleEnv: Record<string, string> = {
  ZEBRA: 'z',
  APPLE: 'a',
  MANGO: 'm',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envoy',
  APP_ENV: 'test',
};

describe('sortEnv', () => {
  it('sorts alphabetically by default', () => {
    const { sorted } = sortEnv(sampleEnv);
    const keys = Object.keys(sorted);
    expect(keys).toEqual([...keys].sort());
  });

  it('sorts in reverse order', () => {
    const { sorted } = sortEnv(sampleEnv, { strategy: 'reverse' });
    const keys = Object.keys(sorted);
    expect(keys[0]).toBe('ZEBRA');
  });

  it('sorts by key length', () => {
    const { sorted } = sortEnv(sampleEnv, { strategy: 'length' });
    const keys = Object.keys(sorted);
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i].length).toBeGreaterThanOrEqual(keys[i - 1].length);
    }
  });

  it('sorts naturally (numeric-aware)', () => {
    const env = { KEY_10: 'ten', KEY_2: 'two', KEY_1: 'one' };
    const { sorted } = sortEnv(env, { strategy: 'natural' });
    expect(Object.keys(sorted)).toEqual(['KEY_1', 'KEY_2', 'KEY_10']);
  });

  it('groups by prefix when option is set', () => {
    const { sorted } = sortEnv(sampleEnv, { groupByPrefix: true });
    const keys = Object.keys(sorted);
    const appIdx = keys.indexOf('APP_ENV');
    const appNameIdx = keys.indexOf('APP_NAME');
    const dbHostIdx = keys.indexOf('DB_HOST');
    const dbPortIdx = keys.indexOf('DB_PORT');
    expect(Math.abs(appIdx - appNameIdx)).toBe(1);
    expect(Math.abs(dbHostIdx - dbPortIdx)).toBe(1);
  });

  it('detects when order has changed', () => {
    const unsorted = { B: '2', A: '1' };
    const { changed } = sortEnv(unsorted);
    expect(changed).toBe(true);
  });

  it('detects when already sorted', () => {
    const alreadySorted = { A: '1', B: '2', C: '3' };
    const { changed } = sortEnv(alreadySorted);
    expect(changed).toBe(false);
  });

  it('preserves values after sorting', () => {
    const { sorted } = sortEnv(sampleEnv);
    for (const [key, value] of Object.entries(sampleEnv)) {
      expect(sorted[key]).toBe(value);
    }
  });
});

describe('formatSortResult', () => {
  it('returns message when changed', () => {
    const result = sortEnv({ B: '2', A: '1' });
    expect(formatSortResult(result)).toContain('Sorted 2 environment variables');
  });

  it('returns already sorted message when unchanged', () => {
    const result = sortEnv({ A: '1', B: '2' });
    expect(formatSortResult(result)).toContain('already sorted');
  });

  it('uses singular form for one variable', () => {
    const result = sortEnv({ B: '2', A: '1' });
    const singleResult = { ...result, sorted: { A: '1' }, original: { B: '1' }, changed: true };
    expect(formatSortResult(singleResult)).toContain('1 environment variable.');
  });
});
