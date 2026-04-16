import { extractKeys, extractByPattern, formatExtractResult } from './envExtractor';

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envoy',
  APP_ENV: 'production',
  SECRET_KEY: 'abc123',
};

describe('extractKeys', () => {
  it('extracts specified keys', () => {
    const result = extractKeys(env, ['DB_HOST', 'DB_PORT']);
    expect(result.extracted).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.keys).toHaveLength(2);
  });

  it('puts non-matching keys in remaining', () => {
    const result = extractKeys(env, ['DB_HOST']);
    expect(result.remaining).toHaveProperty('APP_NAME');
    expect(result.remaining).not.toHaveProperty('DB_HOST');
  });

  it('returns empty extracted for no matching keys', () => {
    const result = extractKeys(env, ['MISSING']);
    expect(result.extracted).toEqual({});
    expect(Object.keys(result.remaining)).toHaveLength(5);
  });
});

describe('extractByPattern', () => {
  it('extracts keys matching pattern', () => {
    const result = extractByPattern(env, '^DB_');
    expect(result.keys).toContain('DB_HOST');
    expect(result.keys).toContain('DB_PORT');
    expect(result.keys).not.toContain('APP_NAME');
  });

  it('extracts keys matching partial pattern', () => {
    const result = extractByPattern(env, 'APP');
    expect(result.keys).toContain('APP_NAME');
    expect(result.keys).toContain('APP_ENV');
  });
});

describe('formatExtractResult', () => {
  it('formats result with counts', () => {
    const result = extractKeys(env, ['DB_HOST']);
    const output = formatExtractResult(result);
    expect(output).toContain('Extracted 1 key(s)');
    expect(output).toContain('DB_HOST=localhost');
    expect(output).toContain('Remaining: 4 key(s)');
  });
});
