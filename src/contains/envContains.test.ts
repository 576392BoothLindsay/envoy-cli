import { containsValue, containsKey, formatContainsResult } from './envContains';

const env: Record<string, string> = {
  DATABASE_URL: 'postgres://localhost:5432/mydb',
  REDIS_URL: 'redis://localhost:6379',
  APP_NAME: 'MyApp',
  DEBUG: 'false',
  SECRET_KEY: 'abc123secret',
};

describe('containsValue', () => {
  it('matches keys whose values contain the substring', () => {
    const result = containsValue(env, 'localhost');
    expect(result.matchedKeys).toContain('DATABASE_URL');
    expect(result.matchedKeys).toContain('REDIS_URL');
    expect(result.matchedKeys).not.toContain('APP_NAME');
  });

  it('returns correct counts', () => {
    const result = containsValue(env, 'localhost');
    expect(result.total).toBe(5);
    expect(result.matchCount).toBe(2);
  });

  it('is case-sensitive by default', () => {
    const result = containsValue(env, 'LOCALHOST');
    expect(result.matchCount).toBe(0);
  });

  it('supports case-insensitive matching', () => {
    const result = containsValue(env, 'LOCALHOST', false);
    expect(result.matchCount).toBe(2);
  });

  it('returns unmatched keys', () => {
    const result = containsValue(env, 'localhost');
    expect(Object.keys(result.unmatched)).toContain('APP_NAME');
    expect(Object.keys(result.unmatched)).toContain('DEBUG');
  });
});

describe('containsKey', () => {
  it('matches keys whose names contain the substring', () => {
    const result = containsKey(env, 'URL');
    expect(result.matchedKeys).toContain('DATABASE_URL');
    expect(result.matchedKeys).toContain('REDIS_URL');
    expect(result.matchedKeys).not.toContain('APP_NAME');
  });

  it('supports case-insensitive key matching', () => {
    const result = containsKey(env, 'url', false);
    expect(result.matchCount).toBe(2);
  });

  it('returns zero matches for unknown substring', () => {
    const result = containsKey(env, 'NONEXISTENT');
    expect(result.matchCount).toBe(0);
  });
});

describe('formatContainsResult', () => {
  it('formats result with match count header', () => {
    const result = containsValue(env, 'localhost');
    const output = formatContainsResult(result);
    expect(output).toContain('Matched: 2/5');
    expect(output).toContain('DATABASE_URL=postgres://localhost:5432/mydb');
  });

  it('shows zero matches gracefully', () => {
    const result = containsValue(env, 'NOPE');
    const output = formatContainsResult(result);
    expect(output).toContain('Matched: 0/5');
  });
});
