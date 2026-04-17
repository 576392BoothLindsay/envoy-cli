import { searchEnv, formatSearchResult } from './envSearch';

const env = {
  DATABASE_URL: 'postgres://localhost/mydb',
  API_KEY: 'secret123',
  APP_NAME: 'my-app',
  DEBUG: 'true',
};

describe('searchEnv', () => {
  it('matches keys by default', () => {
    const results = searchEnv(env, 'API');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('API_KEY');
    expect(results[0].matchedOn).toBe('key');
  });

  it('matches values', () => {
    const results = searchEnv(env, 'postgres');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('DATABASE_URL');
    expect(results[0].matchedOn).toBe('value');
  });

  it('reports both when key and value match', () => {
    const env2 = { SECRET_SECRET: 'secret-value' };
    const results = searchEnv(env2, 'secret', { caseSensitive: false });
    expect(results[0].matchedOn).toBe('both');
  });

  it('respects caseSensitive option', () => {
    const results = searchEnv(env, 'api_key', { caseSensitive: true });
    expect(results).toHaveLength(0);
  });

  it('supports regex queries', () => {
    const results = searchEnv(env, '^APP_', { regex: true });
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('APP_NAME');
  });

  it('can restrict to keys only', () => {
    const results = searchEnv(env, 'true', { matchKeys: true, matchValues: false });
    expect(results).toHaveLength(0);
  });

  it('returns empty when no match', () => {
    const results = searchEnv(env, 'NONEXISTENT');
    expect(results).toHaveLength(0);
  });
});

describe('formatSearchResult', () => {
  it('formats results', () => {
    const results = searchEnv(env, 'API');
    const output = formatSearchResult(results, 'API');
    expect(output).toContain('1 match');
    expect(output).toContain('API_KEY');
  });

  it('shows no matches message', () => {
    const output = formatSearchResult([], 'NOTHING');
    expect(output).toContain('No matches found');
  });
});
