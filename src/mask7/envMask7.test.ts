import { maskValue7, maskEnv7, formatMask7Result } from './envMask7';

describe('maskValue7', () => {
  it('fully masks short values', () => {
    expect(maskValue7('abc')).toBe('***');
  });

  it('masks middle with visible end by default', () => {
    const result = maskValue7('mysecretvalue');
    expect(result).toMatch(/^\*+.{4}$/);
    expect(result.endsWith('alue')).toBe(true);
  });

  it('respects visibleStart option', () => {
    const result = maskValue7('mysecretvalue', { visibleStart: 2, visibleEnd: 0 });
    expect(result.startsWith('my')).toBe(true);
    expect(result).toMatch(/^my\*+$/);
  });

  it('respects custom mask char', () => {
    const result = maskValue7('hello_world', { char: '#', visibleEnd: 0 });
    expect(result).toMatch(/^#+$/);
  });

  it('uses minLength threshold', () => {
    const result = maskValue7('1234', { minLength: 4 });
    expect(result).toBe('****');
  });

  it('masks longer value with both start and end visible', () => {
    const result = maskValue7('abcdefghij', { visibleStart: 2, visibleEnd: 2 });
    expect(result.startsWith('ab')).toBe(true);
    expect(result.endsWith('ij')).toBe(true);
    expect(result).toMatch(/^ab\*+ij$/);
  });
});

describe('maskEnv7', () => {
  const env = { API_KEY: 'supersecret', NAME: 'Alice', TOKEN: 'tok_12345' };

  it('masks specified keys', () => {
    const result = maskEnv7(env, ['API_KEY', 'TOKEN']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'TOKEN']);
    expect(result.masked['NAME']).toBe('Alice');
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['TOKEN']).not.toBe('tok_12345');
  });

  it('ignores keys not in env', () => {
    const result = maskEnv7(env, ['MISSING']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original', () => {
    maskEnv7(env, ['API_KEY']);
    expect(env['API_KEY']).toBe('supersecret');
  });

  it('passes options through', () => {
    const result = maskEnv7(env, ['API_KEY'], { char: '-', visibleEnd: 0 });
    expect(result.masked['API_KEY']).toMatch(/^-+$/);
  });
});

describe('formatMask7Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv7({}, []);
    expect(formatMask7Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const env = { SECRET: 'password123' };
    const result = maskEnv7(env, ['SECRET']);
    const output = formatMask7Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
