import { maskValue22, maskEnv22, formatMask22Result } from './envMask22';

describe('maskValue22', () => {
  it('masks middle characters with default options', () => {
    const result = maskValue22('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue22('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('respects visibleStart and visibleEnd', () => {
    const result = maskValue22('hello_world', { visibleStart: 3, visibleEnd: 3 });
    expect(result).toBe('hel*****rld');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue22('abc', { minLength: 6 });
    expect(result).toBe('***');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue22('secret123', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('se*******');
  });

  it('masks a single character value', () => {
    const result = maskValue22('x', { minLength: 1 });
    expect(result).toBe('*');
  });
});

describe('maskEnv22', () => {
  const env = {
    API_KEY: 'supersecretkey',
    DB_PASS: 'mypassword',
    PUBLIC_URL: 'https://example.com',
  };

  it('masks specified keys', () => {
    const result = maskEnv22(env, ['API_KEY', 'DB_PASS']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe(env['API_KEY']);
    expect(result.masked['DB_PASS']).not.toBe(env['DB_PASS']);
    expect(result.masked['PUBLIC_URL']).toBe(env['PUBLIC_URL']);
  });

  it('does not modify original env', () => {
    const result = maskEnv22(env, ['API_KEY']);
    expect(result.original).toEqual(env);
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv22(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toEqual([]);
  });

  it('returns empty maskedKeys when no keys provided', () => {
    const result = maskEnv22(env, []);
    expect(result.maskedKeys).toHaveLength(0);
  });
});

describe('formatMask22Result', () => {
  it('formats masked result with masked keys', () => {
    const env = { SECRET: 'abc123xyz' };
    const result = maskEnv22(env, ['SECRET']);
    const output = formatMask22Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });

  it('returns message when no keys masked', () => {
    const result = maskEnv22({}, []);
    expect(formatMask22Result(result)).toBe('No keys masked.');
  });
});
