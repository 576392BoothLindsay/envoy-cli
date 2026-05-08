import { maskValue8, maskEnv8, formatMask8Result } from './envMask8';

describe('maskValue8', () => {
  it('masks middle characters by default', () => {
    const result = maskValue8('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue8('ab');
    expect(result).toBe('**');
  });

  it('respects custom char', () => {
    const result = maskValue8('hello123', { char: '#' });
    expect(result).toBe('he####23');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue8('mysecret', { visibleStart: 3, visibleEnd: 1 });
    expect(result).toBe('mys****t');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue8('password', { visibleEnd: 0 });
    expect(result).toBe('pa******');
  });

  it('uses at least one mask character', () => {
    const result = maskValue8('abcd', { visibleStart: 2, visibleEnd: 2 });
    expect(result).toBe('ab*d' || result.includes('*'));
    expect(result).toContain('*');
  });
});

describe('maskEnv8', () => {
  const env = { API_KEY: 'supersecret', DB_PASS: 'dbpassword', NAME: 'alice' };

  it('masks specified keys', () => {
    const result = maskEnv8(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('dbpassword');
    expect(result.masked['NAME']).toBe('alice');
  });

  it('records maskedKeys', () => {
    const result = maskEnv8(env, ['API_KEY']);
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).not.toContain('NAME');
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv8(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv8(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask8Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv8({ A: '1' }, []);
    expect(formatMask8Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys output', () => {
    const result = maskEnv8({ API_KEY: 'topsecret' }, ['API_KEY']);
    const output = formatMask8Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('API_KEY');
  });
});
