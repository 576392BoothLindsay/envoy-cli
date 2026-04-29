import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('secret123')).toBe('********');
  });

  it('masks with custom char', () => {
    expect(maskValue('secret', '#')).toBe('######');
  });

  it('keeps visible trailing chars', () => {
    const result = maskValue('secret123', '*', 3);
    expect(result).toMatch(/\*+123$/);
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });

  it('caps mask length at 8 for short values', () => {
    expect(maskValue('ab')).toBe('**');
  });
});

describe('maskEnv', () => {
  const env = {
    API_KEY: 'supersecret',
    DATABASE_PASSWORD: 'dbpass',
    APP_NAME: 'myapp',
    HOST: 'localhost',
  };

  it('masks secret-like keys automatically', () => {
    const result = maskEnv(env);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DATABASE_PASSWORD']).not.toBe('dbpass');
    expect(result.masked['APP_NAME']).toBe('myapp');
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('masks only specified keys when keys option provided', () => {
    const result = maskEnv(env, { keys: ['APP_NAME'] });
    expect(result.masked['APP_NAME']).not.toBe('myapp');
    expect(result.masked['API_KEY']).toBe('supersecret');
    expect(result.maskedKeys).toEqual(['APP_NAME']);
  });

  it('returns original env unchanged', () => {
    const result = maskEnv(env);
    expect(result.original).toEqual(env);
  });

  it('tracks masked keys', () => {
    const result = maskEnv(env);
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).toContain('DATABASE_PASSWORD');
    expect(result.maskedKeys).not.toContain('APP_NAME');
  });

  it('uses custom mask char', () => {
    const result = maskEnv({ SECRET: 'abc' }, { maskChar: 'X' });
    expect(result.masked['SECRET']).toMatch(/^X+$/);
  });
});

describe('formatMaskResult', () => {
  it('formats result with masked count', () => {
    const result = maskEnv({ API_KEY: 'secret', NAME: 'app' });
    const output = formatMaskResult(result);
    expect(output).toContain('Masked');
    expect(output).toContain('API_KEY');
  });

  it('shows zero masked keys', () => {
    const result = maskEnv({ NAME: 'app' });
    const output = formatMaskResult(result);
    expect(output).toContain('0 key(s)');
  });
});
