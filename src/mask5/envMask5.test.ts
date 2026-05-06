import { maskValue5, maskEnv5, formatMask5Result } from './envMask5';

describe('maskValue5', () => {
  it('masks a long value showing start and end characters', () => {
    const result = maskValue5('supersecret');
    expect(result).toBe('su*******et');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue5('abc');
    expect(result).toBe('***');
  });

  it('respects custom mask character', () => {
    const result = maskValue5('password123', { char: '#' });
    expect(result).toBe('pa#######23');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue5('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue5('abcdefgh', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('ab******');
  });

  it('handles value exactly at minLength', () => {
    const result = maskValue5('abcdef', { minLength: 6 });
    expect(result).toBe('ab**ef');
  });
});

describe('maskEnv5', () => {
  const env = {
    API_KEY: 'supersecretkey',
    DB_PASSWORD: 'mypassword',
    APP_NAME: 'myapp',
  };

  it('masks specified keys', () => {
    const result = maskEnv5(env, ['API_KEY', 'DB_PASSWORD']);
    expect(result.masked['API_KEY']).toBe('su**********ey');
    expect(result.masked['DB_PASSWORD']).toBe('my******rd');
    expect(result.masked['APP_NAME']).toBe('myapp');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASSWORD']);
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv5(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    const original = { ...env };
    maskEnv5(env, ['API_KEY']);
    expect(env).toEqual(original);
  });

  it('returns original env unchanged in result', () => {
    const result = maskEnv5(env, ['API_KEY']);
    expect(result.original).toEqual(env);
  });
});

describe('formatMask5Result', () => {
  it('returns a message when no keys were masked', () => {
    const result = formatMask5Result({
      original: {},
      masked: {},
      maskedKeys: [],
    });
    expect(result).toBe('No keys masked.');
  });

  it('formats masked keys correctly', () => {
    const result = formatMask5Result({
      original: { SECRET: 'abc123' },
      masked: { SECRET: 'ab**23' },
      maskedKeys: ['SECRET'],
    });
    expect(result).toContain('Masked 1 key(s)');
    expect(result).toContain('SECRET: ab**23');
  });
});
