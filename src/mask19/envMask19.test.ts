import { maskValue19, maskEnv19, formatMask19Result } from './envMask19';

describe('maskValue19', () => {
  it('masks middle characters with default options', () => {
    const result = maskValue19('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue19('ab');
    expect(result).toBe('**');
  });

  it('uses custom mask character', () => {
    const result = maskValue19('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('respects visibleStart and visibleEnd overrides', () => {
    const result = maskValue19('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue19('abcdef', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('ab****');
  });

  it('masks value exactly at minLength boundary', () => {
    const result = maskValue19('abcd', { minLength: 4 });
    expect(result).toBe('ab**');
  });

  it('fully masks value below custom minLength', () => {
    const result = maskValue19('abcde', { minLength: 10 });
    expect(result).toBe('*****');
  });
});

describe('maskEnv19', () => {
  const env = { API_KEY: 'supersecret', DB_PASS: 'mypassword', NAME: 'alice' };

  it('masks specified keys', () => {
    const result = maskEnv19(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).toBe('su*********et');
    expect(result.masked['DB_PASS']).toBe('my******rd');
    expect(result.masked['NAME']).toBe('alice');
  });

  it('reports maskedKeys correctly', () => {
    const result = maskEnv19(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv19(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    const original = { SECRET: 'topsecret' };
    maskEnv19(original, ['SECRET']);
    expect(original['SECRET']).toBe('topsecret');
  });
});

describe('formatMask19Result', () => {
  it('formats result with masked key count and values', () => {
    const env = { TOKEN: 'abc123xyz' };
    const result = maskEnv19(env, ['TOKEN']);
    const output = formatMask19Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('TOKEN');
  });

  it('shows zero masked keys when none match', () => {
    const result = maskEnv19({ A: 'val' }, []);
    const output = formatMask19Result(result);
    expect(output).toContain('Masked 0 key(s)');
  });
});
