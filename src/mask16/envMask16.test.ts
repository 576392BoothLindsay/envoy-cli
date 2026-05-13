import { maskValue16, maskEnv16, formatMask16Result } from './envMask16';

describe('maskValue16', () => {
  it('masks middle characters with defaults', () => {
    const result = maskValue16('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue16('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue16('ab');
    expect(result).toBe('**');
  });

  it('respects visibleStart and visibleEnd options', () => {
    const result = maskValue16('hello_world', { visibleStart: 3, visibleEnd: 3 });
    expect(result).toBe('hel*****rld');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue16('secret', { visibleStart: 1, visibleEnd: 0 });
    expect(result).toBe('s*****');
  });
});

describe('maskEnv16', () => {
  const env = { API_KEY: 'supersecret', DB_PASS: 'password123', HOST: 'localhost' };

  it('masks specified keys', () => {
    const result = maskEnv16(env, ['API_KEY', 'DB_PASS']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
    expect(result.masked.API_KEY).not.toBe('supersecret');
    expect(result.masked.HOST).toBe('localhost');
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv16(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    const original = { ...env };
    maskEnv16(env, ['API_KEY']);
    expect(env).toEqual(original);
  });
});

describe('formatMask16Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv16({ HOST: 'localhost' }, []);
    expect(formatMask16Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys output', () => {
    const env = { SECRET: 'mysecret' };
    const result = maskEnv16(env, ['SECRET']);
    const output = formatMask16Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
