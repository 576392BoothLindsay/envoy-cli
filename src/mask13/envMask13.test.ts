import { maskValue13, maskEnv13, formatMask13Result } from './envMask13';

describe('maskValue13', () => {
  it('masks middle of a long value', () => {
    expect(maskValue13('abcdefgh')).toBe('ab****gh');
  });

  it('fully masks short values below minLength', () => {
    expect(maskValue13('abc')).toBe('***');
  });

  it('uses custom mask character', () => {
    expect(maskValue13('abcdefgh', { char: '#' })).toBe('ab####gh');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    expect(maskValue13('abcdefgh', { visibleStart: 1, visibleEnd: 1 })).toBe('a******h');
  });

  it('handles visibleEnd of 0', () => {
    expect(maskValue13('abcdefgh', { visibleEnd: 0 })).toBe('ab******');
  });

  it('handles exact minLength value', () => {
    expect(maskValue13('abcd', { minLength: 4 })).toBe('ab**');
  });

  it('handles empty string', () => {
    expect(maskValue13('')).toBe('');
  });
});

describe('maskEnv13', () => {
  const env = {
    API_KEY: 'supersecret123',
    DB_PASS: 'mypassword',
    HOST: 'localhost',
  };

  it('masks specified keys', () => {
    const result = maskEnv13(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe(env['API_KEY']);
    expect(result.masked['DB_PASS']).not.toBe(env['DB_PASS']);
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('records maskedKeys', () => {
    const result = maskEnv13(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv13(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original record', () => {
    const result = maskEnv13(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret123');
  });
});

describe('formatMask13Result', () => {
  it('formats result with masked keys', () => {
    const env = { SECRET: 'abcdefgh' };
    const result = maskEnv13(env, ['SECRET']);
    const output = formatMask13Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });

  it('returns no keys masked message when empty', () => {
    const result = maskEnv13({}, []);
    expect(formatMask13Result(result)).toBe('No keys masked.');
  });
});
