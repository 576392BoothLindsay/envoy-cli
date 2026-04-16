import { flattenEnv, flattenNested, formatFlattenResult } from './envFlattener';

describe('flattenNested', () => {
  it('flattens a nested object', () => {
    const obj = { db: { host: 'localhost', port: 5432 } };
    const result = flattenNested(obj, { separator: '_' });
    expect(result['DB_HOST']).toBe('localhost');
    expect(result['DB_PORT']).toBe('5432');
  });

  it('handles arrays by joining with comma', () => {
    const obj = { tags: ['a', 'b', 'c'] };
    const result = flattenNested(obj, { separator: '_' });
    expect(result['TAGS']).toBe('a,b,c');
  });

  it('applies prefix', () => {
    const obj = { name: 'test' };
    const result = flattenNested(obj, { separator: '_', prefix: 'APP' });
    expect(result['APP_NAME']).toBe('test');
  });
});

describe('flattenEnv', () => {
  it('flattens JSON values in env record', () => {
    const env = { DB: JSON.stringify({ host: 'localhost', port: '5432' }) };
    const result = flattenEnv(env, { separator: '__' });
    expect(result.flattened['DB__HOST']).toBe('localhost');
    expect(result.flattened['DB__PORT']).toBe('5432');
  });

  it('keeps non-JSON values as-is', () => {
    const env = { FOO: 'bar', BAZ: '123' };
    const result = flattenEnv(env);
    expect(result.flattened['FOO']).toBe('bar');
    expect(result.flattened['BAZ']).toBe('123');
  });

  it('applies prefix to all keys', () => {
    const env = { NAME: 'myapp' };
    const result = flattenEnv(env, { prefix: 'APP' });
    expect(result.flattened['APP_NAME']).toBe('myapp');
  });

  it('returns correct count', () => {
    const env = { A: '1', B: '2', C: JSON.stringify({ x: '3', y: '4' }) };
    const result = flattenEnv(env);
    expect(result.count).toBe(4);
  });
});

describe('formatFlattenResult', () => {
  it('formats result as string', () => {
    const env = { FOO: 'bar' };
    const result = flattenEnv(env);
    const output = formatFlattenResult(result);
    expect(output).toContain('FOO=bar');
    expect(output).toContain('Flattened');
  });
});
