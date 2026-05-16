import { maskValue28, maskEnv28, formatMask28Result } from './envMask28';

describe('maskValue28', () => {
  it('masks the middle of a value by default', () => {
    const result = maskValue28('supersecret');
    expect(result).toBe('su*******et');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue28('abc');
    expect(result).toBe('***');
  });

  it('respects custom mask character', () => {
    const result = maskValue28('helloworld', { char: '#' });
    expect(result).toBe('he######ld');
  });

  it('respects visibleStart and visibleEnd options', () => {
    const result = maskValue28('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue28('password', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('pa******');
  });
});

describe('maskEnv28', () => {
  const env = { API_KEY: 'abc123xyz', DB_PASS: 'secret', NAME: 'public' };

  it('masks specified keys', () => {
    const result = maskEnv28(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('abc123xyz');
    expect(result.masked['DB_PASS']).not.toBe('secret');
    expect(result.masked['NAME']).toBe('public');
  });

  it('reports maskedKeys correctly', () => {
    const result = maskEnv28(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv28(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate the original env', () => {
    const original = { ...env };
    maskEnv28(env, ['API_KEY']);
    expect(env).toEqual(original);
  });
});

describe('formatMask28Result', () => {
  it('returns a no-op message when nothing was masked', () => {
    const result = maskEnv28({ NAME: 'public' }, []);
    expect(formatMask28Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys in output', () => {
    const env = { TOKEN: 'abcdefgh' };
    const result = maskEnv28(env, ['TOKEN']);
    const output = formatMask28Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('TOKEN');
  });
});
