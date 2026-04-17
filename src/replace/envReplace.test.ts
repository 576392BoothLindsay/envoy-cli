import { replaceInValue, replaceInEnv, formatReplaceResult } from './envReplace';

describe('replaceInValue', () => {
  it('replaces a simple string', () => {
    expect(replaceInValue('hello world', 'world', 'earth')).toBe('hello earth');
  });

  it('replaces all occurrences by default', () => {
    expect(replaceInValue('aaa', 'a', 'b')).toBe('bbb');
  });

  it('respects flags', () => {
    expect(replaceInValue('Hello World', 'hello', 'hi', 'i')).toBe('hi World');
  });
});

describe('replaceInEnv', () => {
  const env = { API_URL: 'http://localhost:3000', DB_URL: 'http://localhost:5432', NAME: 'app' };

  it('replaces in all values by default', () => {
    const result = replaceInEnv(env, 'localhost', '127.0.0.1');
    expect(result.replaced.API_URL).toBe('http://127.0.0.1:3000');
    expect(result.replaced.DB_URL).toBe('http://127.0.0.1:5432');
    expect(result.replaced.NAME).toBe('app');
    expect(result.changedKeys).toEqual(['API_URL', 'DB_URL']);
  });

  it('replaces only in specified keys', () => {
    const result = replaceInEnv(env, 'localhost', '0.0.0.0', { keys: ['API_URL'] });
    expect(result.replaced.API_URL).toBe('http://0.0.0.0:3000');
    expect(result.replaced.DB_URL).toBe('http://localhost:5432');
    expect(result.changedKeys).toEqual(['API_URL']);
  });

  it('replaces only in keys matching pattern', () => {
    const result = replaceInEnv(env, 'localhost', 'remotehost', { pattern: '^DB_' });
    expect(result.replaced.DB_URL).toBe('http://remotehost:5432');
    expect(result.replaced.API_URL).toBe('http://localhost:3000');
  });

  it('returns unchanged original', () => {
    const result = replaceInEnv(env, 'notfound', 'x');
    expect(result.changedKeys).toHaveLength(0);
    expect(result.replaced).toEqual(env);
  });
});

describe('formatReplaceResult', () => {
  it('reports no changes', () => {
    const env = { A: '1' };
    const result = { original: env, replaced: env, changedKeys: [] };
    expect(formatReplaceResult(result)).toBe('No values were changed.');
  });

  it('formats changed keys', () => {
    const result = {
      original: { A: 'foo' },
      replaced: { A: 'bar' },
      changedKeys: ['A'],
    };
    const output = formatReplaceResult(result);
    expect(output).toContain('1 key(s)');
    expect(output).toContain('"foo" → "bar"');
  });
});
