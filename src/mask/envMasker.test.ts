import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('secret123')).toBe('********');
  });

  it('uses custom mask char', () => {
    expect(maskValue('abc', '#')).toBe('###');
  });

  it('shows trailing visible chars', () => {
    const result = maskValue('mysecret', '*', 3);
    expect(result).toEndWith('ret');
    expect(result).toContain('*');
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });

  it('caps mask length at 8 for short values', () => {
    expect(maskValue('hi').length).toBe(8);
  });
});

describe('maskEnv', () => {
  const env = {
    API_KEY: 'abc123',
    DB_PASSWORD: 'secret',
    APP_NAME: 'myapp',
    SECRET_TOKEN: 'tok_xyz',
  };

  it('masks keys matching secret patterns by default', () => {
    const result = maskEnv(env);
    expect(result.masked['API_KEY']).not.toBe('abc123');
    expect(result.masked['DB_PASSWORD']).not.toBe('secret');
    expect(result.masked['APP_NAME']).toBe('myapp');
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).toContain('DB_PASSWORD');
  });

  it('masks specific keys when keys option is provided', () => {
    const result = maskEnv(env, { keys: ['APP_NAME'] });
    expect(result.masked['APP_NAME']).not.toBe('myapp');
    expect(result.masked['API_KEY']).toBe('abc123');
    expect(result.maskedKeys).toEqual(['APP_NAME']);
  });

  it('preserves original record', () => {
    const result = maskEnv(env);
    expect(result.original).toEqual(env);
  });

  it('uses custom mask char', () => {
    const result = maskEnv({ SECRET: 'val' }, { maskChar: 'X' });
    expect(result.masked['SECRET']).toMatch(/^X+$/);
  });

  it('returns empty maskedKeys for env with no secrets', () => {
    const result = maskEnv({ APP_NAME: 'test', PORT: '3000' });
    expect(result.maskedKeys).toHaveLength(0);
  });
});

describe('formatMaskResult', () => {
  it('formats masked result correctly', () => {
    const result = maskEnv({ API_KEY: 'abc123', NAME: 'test' });
    const output = formatMaskResult(result);
    expect(output).toContain('Masked');
    expect(output).toContain('API_KEY');
  });

  it('shows zero masked keys when none redacted', () => {
    const result = maskEnv({ NAME: 'test' });
    const output = formatMaskResult(result);
    expect(output).toContain('Masked 0 key(s)');
  });
});
