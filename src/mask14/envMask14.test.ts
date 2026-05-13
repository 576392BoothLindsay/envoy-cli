import { maskValue14, maskEnv14, formatMask14Result } from './envMask14';

describe('maskValue14', () => {
  it('masks a long value showing start and end', () => {
    const result = maskValue14('supersecret123');
    expect(result).toBe('su**********23');
  });

  it('fully masks short values', () => {
    const result = maskValue14('abc');
    expect(result).toBe('***');
  });

  it('respects custom char', () => {
    const result = maskValue14('helloworld', { char: '#' });
    expect(result).toBe('he######ld');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue14('abcdefgh', { visibleStart: 3, visibleEnd: 1 });
    expect(result).toBe('abc****h');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue14('password123', { visibleEnd: 0 });
    expect(result).toBe('pa*********');
  });

  it('respects custom minLength', () => {
    const result = maskValue14('abcd', { minLength: 3 });
    expect(result).toBe('ab**');
  });
});

describe('maskEnv14', () => {
  const env = {
    API_KEY: 'supersecret123',
    DB_PASS: 'mypassword',
    APP_NAME: 'envoy',
  };

  it('masks specified keys', () => {
    const result = maskEnv14(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe(env['API_KEY']);
    expect(result.masked['DB_PASS']).not.toBe(env['DB_PASS']);
    expect(result.masked['APP_NAME']).toBe('envoy');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('does not mask keys not in env', () => {
    const result = maskEnv14(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toEqual([]);
  });

  it('preserves original env', () => {
    const result = maskEnv14(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret123');
  });
});

describe('formatMask14Result', () => {
  it('formats masked keys result', () => {
    const result = maskEnv14({ SECRET: 'abcdefgh' }, ['SECRET']);
    const output = formatMask14Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });

  it('returns message when no keys masked', () => {
    const result = maskEnv14({}, []);
    const output = formatMask14Result(result);
    expect(output).toBe('No keys masked.');
  });
});
