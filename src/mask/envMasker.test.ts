import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('secret')).toBe('******');
  });

  it('masks with custom char', () => {
    expect(maskValue('hello', '#')).toBe('#####');
  });

  it('preserves trailing visible chars', () => {
    expect(maskValue('mysecret', '*', 3)).toBe('*****ret');
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });

  it('handles visibleChars >= length', () => {
    expect(maskValue('abc', '*', 10)).toBe('abc');
  });
});

describe('maskEnv', () => {
  const env = { API_KEY: 'abc123', DB_PASS: 'hunter2', PORT: '3000' };

  it('masks all keys by default', () => {
    const result = maskEnv(env);
    expect(result.masked['API_KEY']).toBe('******');
    expect(result.masked['DB_PASS']).toBe('*******');
    expect(result.masked['PORT']).toBe('****');
    expect(result.maskedKeys).toHaveLength(3);
  });

  it('masks only specified keys', () => {
    const result = maskEnv(env, { keys: ['API_KEY', 'DB_PASS'] });
    expect(result.masked['API_KEY']).toBe('******');
    expect(result.masked['DB_PASS']).toBe('*******');
    expect(result.masked['PORT']).toBe('3000');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('uses custom char', () => {
    const result = maskEnv({ KEY: 'val' }, { char: 'x' });
    expect(result.masked['KEY']).toBe('xxx');
  });

  it('preserves visible chars', () => {
    const result = maskEnv({ KEY: 'password' }, { visibleChars: 2 });
    expect(result.masked['KEY']).toBe('******rd');
  });

  it('preserves original env unchanged', () => {
    const result = maskEnv(env);
    expect(result.original).toEqual(env);
  });
});

describe('formatMaskResult', () => {
  it('formats result with masked keys count', () => {
    const result = maskEnv({ A: 'hello', B: 'world' }, { keys: ['A'] });
    const output = formatMaskResult(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('A=*****');
    expect(output).toContain('B=world');
  });
});
