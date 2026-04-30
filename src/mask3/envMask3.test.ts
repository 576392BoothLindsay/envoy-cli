import { maskValue3, maskEnv3, formatMask3Result } from './envMask3';

describe('maskValue3', () => {
  it('applies full masking by default', () => {
    expect(maskValue3('secret')).toBe('******');
  });

  it('applies full masking with custom char', () => {
    expect(maskValue3('abc', { char: '#' })).toBe('###');
  });

  it('applies partial masking', () => {
    const result = maskValue3('mysecret', { strategy: 'partial', visibleChars: 2 });
    expect(result).toMatch(/^my.*et$/);
  });

  it('applies length masking', () => {
    const result = maskValue3('hello', { strategy: 'length' });
    expect(result).toBe('*****(5)');
  });

  it('returns empty string unchanged', () => {
    expect(maskValue3('')).toBe('');
  });

  it('handles single character values', () => {
    expect(maskValue3('x')).toBe('*');
  });
});

describe('maskEnv3', () => {
  const env = { API_KEY: 'abc123', DB_PASS: 'secret', NAME: 'app' };

  it('masks specified keys', () => {
    const result = maskEnv3(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked.API_KEY).toBe('******');
    expect(result.masked.DB_PASS).toBe('******');
    expect(result.masked.NAME).toBe('app');
  });

  it('tracks masked keys', () => {
    const result = maskEnv3(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv3(env, ['MISSING']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv3(env, ['API_KEY']);
    expect(result.original.API_KEY).toBe('abc123');
  });

  it('supports partial strategy', () => {
    const result = maskEnv3(env, ['API_KEY'], { strategy: 'partial', visibleChars: 1 });
    expect(result.masked.API_KEY).toMatch(/^a.*3$/);
  });
});

describe('formatMask3Result', () => {
  it('formats result with masked keys', () => {
    const env = { TOKEN: 'supersecret' };
    const result = maskEnv3(env, ['TOKEN']);
    const output = formatMask3Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('TOKEN');
    expect(output).toContain('supersecret');
  });

  it('shows zero masked keys when none match', () => {
    const result = maskEnv3({ A: '1' }, []);
    const output = formatMask3Result(result);
    expect(output).toContain('Masked 0 key(s)');
  });
});
