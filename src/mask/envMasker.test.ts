import { maskValue, maskEnv, formatMaskResult, MaskOptions } from './envMasker';

describe('maskValue', () => {
  it('masks full value by default', () => {
    expect(maskValue('secret123')).toBe('*********');
  });

  it('uses custom char', () => {
    expect(maskValue('abc', { char: '#' })).toBe('###');
  });

  it('partial strategy shows last N chars', () => {
    expect(maskValue('mysecret', { strategy: 'partial', visibleChars: 3 })).toBe('*****ret');
  });

  it('partial strategy masks all if value too short', () => {
    expect(maskValue('ab', { strategy: 'partial', visibleChars: 4 })).toBe('**');
  });

  it('length strategy shows char count', () => {
    const result = maskValue('hello', { strategy: 'length' });
    expect(result).toContain('5 chars');
    expect(result).toContain('********');
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

  it('masks custom keys', () => {
    const result = maskEnv(env, {}, ['APP_NAME']);
    expect(result.masked['APP_NAME']).toBe('*****');
  });

  it('tracks maskedKeys', () => {
    const result = maskEnv(env);
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).toContain('DATABASE_PASSWORD');
    expect(result.maskedKeys).not.toContain('APP_NAME');
  });

  it('preserves original env', () => {
    const result = maskEnv(env);
    expect(result.original).toEqual(env);
  });

  it('applies mask options', () => {
    const options: MaskOptions = { strategy: 'partial', visibleChars: 2 };
    const result = maskEnv({ API_KEY: 'abcdef' }, options);
    expect(result.masked['API_KEY']).toBe('****ef');
  });
});

describe('formatMaskResult', () => {
  it('reports no masked keys', () => {
    const result = formatMaskResult({
      original: { APP: 'val' },
      masked: { APP: 'val' },
      maskedKeys: [],
    });
    expect(result).toContain('No keys were masked');
  });

  it('lists masked keys', () => {
    const result = formatMaskResult({
      original: { API_KEY: 'abc' },
      masked: { API_KEY: '***' },
      maskedKeys: ['API_KEY'],
    });
    expect(result).toContain('Masked 1 key(s)');
    expect(result).toContain('API_KEY');
  });
});
