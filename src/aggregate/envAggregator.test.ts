import { aggregateEnv, formatAggregateResult } from './envAggregator';

describe('aggregateEnv', () => {
  const env = {
    APP_NAME: 'myapp',
    APP_ENV: 'production',
    APP_PORT: '3000',
    DB_HOST: 'localhost',
    DB_PORT: '5432',
    DB_PASS: '',
    FEATURE_FLAG: 'true',
    DEBUG: 'false',
    CACHE_TTL: '300',
    EMPTY_KEY: '',
  };

  it('counts total keys', () => {
    const result = aggregateEnv(env);
    expect(result.stats.totalKeys).toBe(10);
  });

  it('counts empty values', () => {
    const result = aggregateEnv(env);
    expect(result.stats.emptyValues).toBe(2);
  });

  it('counts numeric values', () => {
    const result = aggregateEnv(env);
    expect(result.stats.numericValues).toBe(3); // 3000, 5432, 300
  });

  it('counts boolean values', () => {
    const result = aggregateEnv(env);
    expect(result.stats.booleanValues).toBe(2); // true, false
  });

  it('identifies longest key', () => {
    const result = aggregateEnv(env);
    expect(result.stats.longestKey).toBe('FEATURE_FLAG');
  });

  it('groups keys by prefix', () => {
    const result = aggregateEnv(env);
    expect(result.byPrefix['APP']).toBe(3);
    expect(result.byPrefix['DB']).toBe(3);
  });

  it('computes value frequency', () => {
    const envWithDupes = { A: 'same', B: 'same', C: 'other' };
    const result = aggregateEnv(envWithDupes);
    expect(result.valueFrequency['same']).toBe(2);
    expect(result.valueFrequency['other']).toBe(1);
  });

  it('handles empty env', () => {
    const result = aggregateEnv({});
    expect(result.stats.totalKeys).toBe(0);
    expect(result.stats.averageValueLength).toBe(0);
    expect(result.stats.longestKey).toBe('');
  });

  it('calculates average value length', () => {
    const simple = { A: 'hi', B: 'hello' };
    const result = aggregateEnv(simple);
    expect(result.stats.averageValueLength).toBe(4); // (2+5)/2 = 3.5 -> 4
  });
});

describe('formatAggregateResult', () => {
  it('returns a formatted string', () => {
    const env = { APP_NAME: 'test', APP_ENV: 'dev', DB_HOST: 'localhost' };
    const result = aggregateEnv(env);
    const output = formatAggregateResult(result);
    expect(output).toContain('Total keys');
    expect(output).toContain('Keys by Prefix');
    expect(output).toContain('APP_*');
  });

  it('omits repeated values section when no duplicates', () => {
    const env = { A: 'x', B: 'y', C: 'z' };
    const result = aggregateEnv(env);
    const output = formatAggregateResult(result);
    expect(output).not.toContain('Most Repeated Values');
  });

  it('shows repeated values when present', () => {
    const env = { A: 'dup', B: 'dup', C: 'dup' };
    const result = aggregateEnv(env);
    const output = formatAggregateResult(result);
    expect(output).toContain('Most Repeated Values');
    expect(output).toContain('3x');
  });
});
