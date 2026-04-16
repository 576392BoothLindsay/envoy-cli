import { countKeys, formatCountResult } from './envCounter';

describe('countKeys', () => {
  it('returns zeros for empty env', () => {
    const result = countKeys({});
    expect(result.total).toBe(0);
    expect(result.withValues).toBe(0);
    expect(result.empty).toBe(0);
    expect(result.byPrefix).toEqual({});
  });

  it('counts total, withValues, and empty correctly', () => {
    const env = { FOO: 'bar', BAZ: '', QUX: 'hello' };
    const result = countKeys(env);
    expect(result.total).toBe(3);
    expect(result.withValues).toBe(2);
    expect(result.empty).toBe(1);
  });

  it('groups keys by prefix', () => {
    const env = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'envoy',
      NOPREFIXKEY: 'val',
    };
    const result = countKeys(env);
    expect(result.byPrefix['DB']).toBe(2);
    expect(result.byPrefix['APP']).toBe(1);
    expect(result.byPrefix['NOPREFIXKEY']).toBeUndefined();
  });

  it('handles keys with no underscore', () => {
    const env = { SIMPLE: 'value' };
    const result = countKeys(env);
    expect(result.byPrefix).toEqual({});
  });
});

describe('formatCountResult', () => {
  it('formats result with prefix breakdown', () => {
    const result = {
      total: 3,
      withValues: 2,
      empty: 1,
      byPrefix: { DB: 2, APP: 1 },
    };
    const output = formatCountResult(result);
    expect(output).toContain('Total keys   : 3');
    expect(output).toContain('With values  : 2');
    expect(output).toContain('Empty values : 1');
    expect(output).toContain('DB_* : 2');
    expect(output).toContain('APP_* : 1');
  });

  it('omits prefix section when no prefixes', () => {
    const result = { total: 1, withValues: 1, empty: 0, byPrefix: {} };
    const output = formatCountResult(result);
    expect(output).not.toContain('By prefix');
  });
});
