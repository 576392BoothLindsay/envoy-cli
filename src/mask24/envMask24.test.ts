import { maskValue24, maskEnv24, formatMask24Result } from './envMask24';

describe('maskValue24', () => {
  it('masks entire value when visibleStart and visibleEnd are 0', () => {
    const result = maskValue24('secret', { visibleStart: 0, visibleEnd: 0 });
    expect(result).toBe('******');
  });

  it('shows last 4 characters by default', () => {
    const result = maskValue24('mysecretvalue');
    expect(result).toMatch(/\*+alue$/);
  });

  it('uses custom mask character', () => {
    const result = maskValue24('hello', { char: '#', visibleEnd: 0 });
    expect(result).toBe('#####');
  });

  it('masks short values below minLength fully', () => {
    const result = maskValue24('ab', { minLength: 3 });
    expect(result).toBe('**');
  });

  it('shows visible start and end', () => {
    const result = maskValue24('abcdefgh', { visibleStart: 2, visibleEnd: 2 });
    expect(result).toMatch(/^ab\*+gh$/);
  });
});

describe('maskEnv24', () => {
  const env = { API_KEY: 'supersecret', DB_PASS: 'dbpass123', NAME: 'public' };

  it('masks specified keys', () => {
    const result = maskEnv24(env, ['API_KEY', 'DB_PASS']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
    expect(result.masked['NAME']).toBe('public');
    expect(result.masked['API_KEY']).not.toBe('supersecret');
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv24(env, ['NONEXISTENT']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('returns original env unchanged', () => {
    const result = maskEnv24(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });

  it('handles empty keys array', () => {
    const result = maskEnv24(env, []);
    expect(result.maskedKeys).toHaveLength(0);
    expect(result.masked).toEqual(env);
  });
});

describe('formatMask24Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv24({ FOO: 'bar' }, []);
    expect(formatMask24Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys correctly', () => {
    const result = maskEnv24({ SECRET: 'abc123' }, ['SECRET']);
    const output = formatMask24Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
