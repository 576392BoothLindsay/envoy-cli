import { maskValue18, maskEnv18, formatMask18Result } from './envMask18';

describe('maskValue18', () => {
  it('masks middle of a long value', () => {
    const result = maskValue18('abcdefgh', { visibleStart: 2, visibleEnd: 2 });
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue18('abcdefgh', { char: '#', visibleStart: 2, visibleEnd: 2 });
    expect(result).toBe('ab####gh');
  });

  it('fully masks short values', () => {
    const result = maskValue18('abc', { minLength: 6 });
    expect(result).toBe('***');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue18('abcdefgh', { visibleStart: 2, visibleEnd: 0, minLength: 3 });
    expect(result).toBe('ab******');
  });

  it('uses defaults when no options provided', () => {
    const result = maskValue18('password123');
    expect(result.startsWith('pa')).toBe(true);
    expect(result.endsWith('23')).toBe(true);
    expect(result).toContain('*');
  });
});

describe('maskEnv18', () => {
  const env = {
    API_KEY: 'supersecretkey',
    DB_PASSWORD: 'mypassword',
    HOST: 'localhost',
  };

  it('masks specified keys', () => {
    const result = maskEnv18(env, ['API_KEY', 'DB_PASSWORD']);
    expect(result.masked['API_KEY']).not.toBe('supersecretkey');
    expect(result.masked['DB_PASSWORD']).not.toBe('mypassword');
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('records masked keys', () => {
    const result = maskEnv18(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('skips keys not in env', () => {
    const result = maskEnv18(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv18(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecretkey');
  });
});

describe('formatMask18Result', () => {
  it('formats masked keys output', () => {
    const env = { SECRET: 'abc123' };
    const result = maskEnv18(env, ['SECRET'], { visibleStart: 1, visibleEnd: 1, minLength: 2 });
    const output = formatMask18Result(result);
    expect(output).toContain('SECRET');
    expect(output).toContain('→');
  });

  it('returns no keys message when nothing masked', () => {
    const result = maskEnv18({}, []);
    expect(formatMask18Result(result)).toBe('No keys masked.');
  });
});
