import { maskValue6, maskEnv6, formatMask6Result } from './envMask6';

describe('maskValue6', () => {
  it('masks a normal value with defaults', () => {
    const result = maskValue6('secretpassword');
    expect(result).toBe('se**********rd');
  });

  it('fully masks short values', () => {
    const result = maskValue6('abc');
    expect(result).toBe('***');
  });

  it('respects custom char', () => {
    const result = maskValue6('hello', { char: '#', visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('h###o');
  });

  it('respects visibleStart and visibleEnd of 0', () => {
    const result = maskValue6('password', { visibleStart: 0, visibleEnd: 0 });
    expect(result).toBe('********');
  });

  it('handles empty string', () => {
    const result = maskValue6('');
    expect(result).toBe('');
  });

  it('handles exact minLength', () => {
    const result = maskValue6('abcd', { minLength: 4 });
    expect(result).toBe('****');
  });
});

describe('maskEnv6', () => {
  const env = {
    API_KEY: 'supersecret',
    DB_PASS: 'mypassword',
    APP_NAME: 'myapp',
  };

  it('masks specified keys', () => {
    const result = maskEnv6(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('mypassword');
    expect(result.masked['APP_NAME']).toBe('myapp');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv6(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original', () => {
    const result = maskEnv6(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });

  it('returns empty maskedKeys for empty keys array', () => {
    const result = maskEnv6(env, []);
    expect(result.maskedKeys).toHaveLength(0);
  });
});

describe('formatMask6Result', () => {
  it('formats result with masked keys', () => {
    const env = { SECRET: 'abc123' };
    const result = maskEnv6(env, ['SECRET']);
    const output = formatMask6Result(result);
    expect(output).toContain('Masked 1 key(s):');
    expect(output).toContain('SECRET=');
  });

  it('reports no keys masked', () => {
    const env = { APP: 'test' };
    const result = maskEnv6(env, []);
    const output = formatMask6Result(result);
    expect(output).toBe('No keys were masked.');
  });
});
