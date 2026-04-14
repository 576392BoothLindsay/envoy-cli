import { transformKeys, transformValues, formatTransformResult } from './envTransformer';

const sampleEnv: Record<string, string> = {
  api_key: 'abc123',
  db_host: 'localhost',
  APP_SECRET: 'supersecret',
};

describe('transformKeys', () => {
  it('uppercases all keys', () => {
    const result = transformKeys(sampleEnv, { strategy: 'uppercase' });
    expect(result.transformed).toHaveProperty('API_KEY');
    expect(result.transformed).toHaveProperty('DB_HOST');
    expect(result.transformed).toHaveProperty('APP_SECRET');
    expect(result.changedKeys).toContain('api_key');
    expect(result.changedKeys).toContain('db_host');
  });

  it('lowercases all keys', () => {
    const result = transformKeys(sampleEnv, { strategy: 'lowercase' });
    expect(result.transformed).toHaveProperty('app_secret');
    expect(result.changedKeys).toContain('APP_SECRET');
  });

  it('adds a prefix to all keys', () => {
    const result = transformKeys(sampleEnv, { strategy: 'prefix', prefix: 'MY_' });
    expect(result.transformed).toHaveProperty('MY_api_key');
    expect(result.transformed).toHaveProperty('MY_db_host');
  });

  it('adds a suffix to all keys', () => {
    const result = transformKeys(sampleEnv, { strategy: 'suffix', suffix: '_VAR' });
    expect(result.transformed).toHaveProperty('api_key_VAR');
  });

  it('only transforms targeted keys', () => {
    const result = transformKeys(sampleEnv, { strategy: 'uppercase', targetKeys: ['api_key'] });
    expect(result.transformed).toHaveProperty('API_KEY');
    expect(result.transformed).toHaveProperty('db_host');
    expect(result.changedKeys).toEqual(['api_key']);
  });

  it('returns empty changedKeys if nothing changes', () => {
    const env = { API_KEY: 'val' };
    const result = transformKeys(env, { strategy: 'uppercase' });
    expect(result.changedKeys).toHaveLength(0);
  });
});

describe('transformValues', () => {
  it('uppercases all values', () => {
    const result = transformValues(sampleEnv, { strategy: 'uppercase' });
    expect(result.transformed['api_key']).toBe('ABC123');
    expect(result.transformed['db_host']).toBe('LOCALHOST');
  });

  it('trims values', () => {
    const env = { KEY: '  value  ' };
    const result = transformValues(env, { strategy: 'trim' });
    expect(result.transformed['KEY']).toBe('value');
    expect(result.changedKeys).toContain('KEY');
  });

  it('applies prefix to values of targeted keys only', () => {
    const result = transformValues(sampleEnv, { strategy: 'prefix', prefix: 'env_', targetKeys: ['db_host'] });
    expect(result.transformed['db_host']).toBe('env_localhost');
    expect(result.transformed['api_key']).toBe('abc123');
  });
});

describe('formatTransformResult', () => {
  it('returns no-change message when nothing changed', () => {
    const result = { original: {}, transformed: {}, changedKeys: [] };
    expect(formatTransformResult(result)).toBe('No changes applied.');
  });

  it('lists changed keys', () => {
    const result = { original: {}, transformed: {}, changedKeys: ['api_key', 'db_host'] };
    const output = formatTransformResult(result);
    expect(output).toContain('2 key(s)');
    expect(output).toContain('api_key');
    expect(output).toContain('db_host');
  });
});
