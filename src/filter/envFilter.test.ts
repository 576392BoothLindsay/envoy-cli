import { filterEnv, filterByPrefix, formatFilterResult } from './envFilter';

const sampleEnv: Record<string, string> = {
  APP_NAME: 'envoy',
  APP_VERSION: '1.0.0',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
  DEBUG: 'true',
};

describe('filterEnv', () => {
  it('includes only specified keys', () => {
    const result = filterEnv(sampleEnv, { keys: ['APP_NAME', 'DEBUG'], mode: 'include' });
    expect(result.filtered).toEqual({ APP_NAME: 'envoy', DEBUG: 'true' });
    expect(result.matched).toContain('APP_NAME');
  });

  it('excludes specified keys', () => {
    const result = filterEnv(sampleEnv, { keys: ['SECRET_KEY'], mode: 'exclude' });
    expect(result.filtered).not.toHaveProperty('SECRET_KEY');
    expect(Object.keys(result.filtered).length).toBe(5);
  });

  it('filters by string pattern (include)', () => {
    const result = filterEnv(sampleEnv, { pattern: 'DB_', mode: 'include' });
    expect(result.filtered).toHaveProperty('DB_HOST');
    expect(result.filtered).toHaveProperty('DB_PORT');
    expect(result.matched.length).toBe(2);
  });

  it('filters by regex pattern (exclude)', () => {
    const result = filterEnv(sampleEnv, { pattern: /^APP_/, mode: 'exclude' });
    expect(result.filtered).not.toHaveProperty('APP_NAME');
    expect(result.filtered).not.toHaveProperty('APP_VERSION');
  });

  it('combines keys and pattern', () => {
    const result = filterEnv(sampleEnv, { keys: ['DEBUG'], pattern: /^DB_/, mode: 'include' });
    expect(result.filtered).toHaveProperty('DEBUG');
    expect(result.filtered).toHaveProperty('DB_HOST');
  });

  it('returns empty filtered when no match in include mode', () => {
    const result = filterEnv(sampleEnv, { keys: ['NONEXISTENT'], mode: 'include' });
    expect(result.filtered).toEqual({});
  });
});

describe('filterByPrefix', () => {
  it('returns only keys with prefix', () => {
    const result = filterByPrefix(sampleEnv, 'APP_');
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_VERSION']);
  });

  it('strips prefix when strip=true', () => {
    const result = filterByPrefix(sampleEnv, 'APP_', true);
    expect(result).toHaveProperty('NAME', 'envoy');
    expect(result).toHaveProperty('VERSION', '1.0.0');
  });
});

describe('formatFilterResult', () => {
  it('formats result summary', () => {
    const result = filterEnv(sampleEnv, { pattern: /^DB_/, mode: 'include' });
    const output = formatFilterResult(result);
    expect(output).toContain('Matched keys');
    expect(output).toContain('Filtered entries: 2');
  });
});
