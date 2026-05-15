import { maskValue26, maskEnv26, formatMask26Result } from './envMask26';

describe('maskValue26', () => {
  it('masks middle characters with defaults', () => {
    const result = maskValue26('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue26('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('respects visibleStart and visibleEnd', () => {
    const result = maskValue26('hello123', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('h******3');
  });

  it('masks entire short value below minLength', () => {
    const result = maskValue26('ab', { minLength: 4 });
    expect(result).toBe('**');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue26('password', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('pa******');
  });

  it('ensures at least one mask character in middle', () => {
    const result = maskValue26('abcd', { visibleStart: 2, visibleEnd: 2 });
    expect(result).toMatch(/^ab\*+cd$/);
  });
});

describe('maskEnv26', () => {
  const env = {
    API_KEY: 'supersecret',
    DB_PASS: 'mypassword',
    HOST: 'localhost',
  };

  it('masks specified keys', () => {
    const result = maskEnv26(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('mypassword');
    expect(result.masked['HOST']).toBe('localhost');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv26(env, ['NONEXISTENT']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv26(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask26Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv26({ A: '1' }, []);
    expect(formatMask26Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys correctly', () => {
    const result = maskEnv26({ SECRET: 'abcdef' }, ['SECRET']);
    const output = formatMask26Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
