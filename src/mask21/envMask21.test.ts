import { maskValue21, maskEnv21, formatMask21Result } from './envMask21';

describe('maskValue21', () => {
  it('masks middle characters with default options', () => {
    const result = maskValue21('mysecretvalue');
    expect(result).toBe('my*********ue');
  });

  it('uses custom mask character', () => {
    const result = maskValue21('mysecretvalue', { char: '#' });
    expect(result).toBe('my#########ue');
  });

  it('masks entire value when shorter than minLength', () => {
    const result = maskValue21('abc', { minLength: 6 });
    expect(result).toBe('***');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue21('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('handles empty string', () => {
    const result = maskValue21('');
    expect(result).toBe('');
  });
});

describe('maskEnv21', () => {
  const env = { API_KEY: 'supersecret123', DB_PASS: 'dbpassword', HOST: 'localhost' };

  it('masks specified keys', () => {
    const result = maskEnv21(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret123');
    expect(result.masked['DB_PASS']).not.toBe('dbpassword');
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('tracks masked keys', () => {
    const result = maskEnv21(env, ['API_KEY']);
    expect(result.maskedKeys).toContain('API_KEY');
    expect(result.maskedKeys).not.toContain('HOST');
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv21(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    const original = { ...env };
    maskEnv21(env, ['API_KEY']);
    expect(env).toEqual(original);
  });
});

describe('formatMask21Result', () => {
  it('returns message when no keys masked', () => {
    const result = formatMask21Result({ original: {}, masked: {}, maskedKeys: [] });
    expect(result).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const env = { SECRET: 'myvalue123' };
    const result = maskEnv21(env, ['SECRET']);
    const formatted = formatMask21Result(result);
    expect(formatted).toContain('Masked 1 key(s)');
    expect(formatted).toContain('SECRET');
  });
});
