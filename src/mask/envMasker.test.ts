import { maskValue, maskEnv, formatMaskResult, MaskOptions } from './envMasker';

describe('maskValue', () => {
  it('masks entire value with stars by default', () => {
    expect(maskValue('secret123')).toBe('*********');
  });

  it('masks with partial style showing first chars', () => {
    expect(maskValue('secret123', { style: 'partial', visibleChars: 3 })).toBe('sec******');
  });

  it('partial style limits visible chars to half of value length', () => {
    expect(maskValue('ab', { style: 'partial', visibleChars: 4 })).toBe('**');
  });

  it('masks with length style', () => {
    expect(maskValue('secret123', { style: 'length' })).toBe('[9 chars]');
  });

  it('masks with fixed style', () => {
    expect(maskValue('secret123', { style: 'fixed', fixedMask: 'REDACTED' })).toBe('REDACTED');
  });

  it('uses default fixed mask when none provided', () => {
    expect(maskValue('secret123', { style: 'fixed' })).toBe('***');
  });

  it('returns empty string unchanged', () => {
    expect(maskValue('')).toBe('');
  });
});

describe('maskEnv', () => {
  const env = {
    API_KEY: 'abc123',
    DATABASE_PASSWORD: 'supersecret',
    APP_NAME: 'myapp',
    SECRET_TOKEN: 'tok_xyz',
  };

  it('masks keys that match secret patterns', () => {
    const result = maskEnv(env);
    expect(result.masked['API_KEY']).toBe('******');
    expect(result.masked['DATABASE_PASSWORD']).toBe('***********');
    expect(result.masked['SECRET_TOKEN']).toBe('*******');
    expect(result.masked['APP_NAME']).toBe('myapp');
  });

  it('includes masked keys list', () => {
    const result = maskEnv(env);
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).toContain('DATABASE_PASSWORD');
    expect(result.maskedKeys).not.toContain('APP_NAME');
  });

  it('preserves original env', () => {
    const result = maskEnv(env);
    expect(result.original['API_KEY']).toBe('abc123');
  });

  it('masks custom keys', () => {
    const result = maskEnv(env, {}, ['APP_NAME']);
    expect(result.masked['APP_NAME']).toBe('*****');
    expect(result.maskedKeys).toContain('APP_NAME');
  });

  it('applies mask options to masked values', () => {
    const options: MaskOptions = { style: 'fixed', fixedMask: 'HIDDEN' };
    const result = maskEnv(env, options);
    expect(result.masked['API_KEY']).toBe('HIDDEN');
  });
});

describe('formatMaskResult', () => {
  it('formats mask result with key count and changes', () => {
    const result = maskEnv({ API_KEY: 'abc123', HOST: 'localhost' });
    const formatted = formatMaskResult(result);
    expect(formatted).toContain('Masked 1 key(s):');
    expect(formatted).toContain('API_KEY');
    expect(formatted).toContain('abc123');
    expect(formatted).toContain('→');
  });
});
