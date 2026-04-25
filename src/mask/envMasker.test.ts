import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks most of a value, leaving visible tail chars', () => {
    const result = maskValue('supersecret');
    expect(result).toMatch(/^\*+et$/);
    expect(result.length).toBe('supersecret'.length);
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue('abc');
    expect(result).toBe('***');
  });

  it('uses custom mask char', () => {
    const result = maskValue('password', { char: '#' });
    expect(result).toMatch(/^#+/);
  });

  it('respects visibleChars option', () => {
    const result = maskValue('mypassword', { visibleChars: 4 });
    expect(result.slice(-4)).toBe('word');
  });

  it('handles empty string', () => {
    const result = maskValue('');
    expect(result).toBe('');
  });
});

describe('maskEnv', () => {
  const env = {
    API_KEY: 'supersecret',
    DB_PASSWORD: 'hunter2',
    APP_NAME: 'myapp',
  };

  it('masks specified keys', () => {
    const result = maskEnv(env, ['API_KEY', 'DB_PASSWORD']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASSWORD']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASSWORD']).not.toBe('hunter2');
  });

  it('does not mask unspecified keys', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.masked['APP_NAME']).toBe('myapp');
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv(env, ['NONEXISTENT']);
    expect(result.maskedKeys).toEqual([]);
  });

  it('preserves original env unchanged', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMaskResult', () => {
  it('formats masked keys output', () => {
    const env = { SECRET: 'abc123' };
    const result = maskEnv(env, ['SECRET']);
    const output = formatMaskResult(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });

  it('returns message when no keys masked', () => {
    const env = { APP: 'test' };
    const result = maskEnv(env, []);
    const output = formatMaskResult(result);
    expect(output).toBe('No keys masked.');
  });
});
