import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('secret')).toBe('******');
  });

  it('uses custom mask character', () => {
    expect(maskValue('hello', '#')).toBe('#####');
  });

  it('leaves last N chars visible', () => {
    expect(maskValue('mysecret', '*', 3)).toBe('*****ret');
  });

  it('handles empty value', () => {
    expect(maskValue('')).toBe('');
  });

  it('handles visibleChars >= value length', () => {
    expect(maskValue('abc', '*', 10)).toBe('abc');
  });
});

describe('maskEnv', () => {
  const env = { API_KEY: 'abc123', DB_PASS: 'secret', APP_NAME: 'myapp' };

  it('masks all keys by default', () => {
    const result = maskEnv(env);
    expect(result.masked.API_KEY).toBe('******');
    expect(result.masked.DB_PASS).toBe('******');
    expect(result.masked.APP_NAME).toBe('*****');
    expect(result.maskedKeys).toHaveLength(3);
  });

  it('masks only specified keys', () => {
    const result = maskEnv(env, { keys: ['API_KEY', 'DB_PASS'] });
    expect(result.masked.API_KEY).toBe('******');
    expect(result.masked.DB_PASS).toBe('******');
    expect(result.masked.APP_NAME).toBe('myapp');
    expect(result.maskedKeys).toHaveLength(2);
  });

  it('uses custom char and visibleChars', () => {
    const result = maskEnv({ SECRET: 'password' }, { char: '-', visibleChars: 2 });
    expect(result.masked.SECRET).toBe('------rd');
  });

  it('preserves original env', () => {
    const result = maskEnv(env);
    expect(result.original).toEqual(env);
  });
});

describe('formatMaskResult', () => {
  it('formats result with masked keys count', () => {
    const result = maskEnv({ KEY: 'val' });
    const output = formatMaskResult(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('KEY=***');
  });
});
