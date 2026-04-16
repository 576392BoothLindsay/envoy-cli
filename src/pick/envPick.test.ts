import { pickKeys, pickByPattern, formatPickResult } from './envPick';

const env = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  APP_NAME: 'envoy',
};

describe('pickKeys', () => {
  it('picks specified keys', () => {
    const result = pickKeys(env, ['DB_HOST', 'DB_PORT']);
    expect(result.picked).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.missing).toEqual([]);
    expect(result.count).toBe(2);
  });

  it('reports missing keys', () => {
    const result = pickKeys(env, ['DB_HOST', 'MISSING_KEY']);
    expect(result.picked).toEqual({ DB_HOST: 'localhost' });
    expect(result.missing).toEqual(['MISSING_KEY']);
  });

  it('returns empty when no keys match', () => {
    const result = pickKeys(env, ['NOPE']);
    expect(result.count).toBe(0);
    expect(result.missing).toEqual(['NOPE']);
  });
});

describe('pickByPattern', () => {
  it('picks keys matching regex', () => {
    const result = pickByPattern(env, /^DB_/);
    expect(result.picked).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(result.missing).toEqual([]);
  });

  it('returns empty for non-matching pattern', () => {
    const result = pickByPattern(env, /^NONEXISTENT_/);
    expect(result.count).toBe(0);
  });
});

describe('formatPickResult', () => {
  it('formats result with missing keys', () => {
    const result = pickKeys(env, ['DB_HOST', 'MISSING']);
    const output = formatPickResult(result);
    expect(output).toContain('Picked 1 key(s)');
    expect(output).toContain('Missing keys: MISSING');
    expect(output).toContain('DB_HOST=localhost');
  });

  it('formats result without missing keys', () => {
    const result = pickKeys(env, ['API_KEY']);
    const output = formatPickResult(result);
    expect(output).not.toContain('Missing');
    expect(output).toContain('API_KEY=secret');
  });
});
