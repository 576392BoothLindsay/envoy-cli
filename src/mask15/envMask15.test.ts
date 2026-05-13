import { maskValue15, maskEnv15, formatMask15Result } from './envMask15';

describe('maskValue15', () => {
  it('masks a value with default options', () => {
    const result = maskValue15('mysecretvalue');
    expect(result).toBe('my*********ue');
  });

  it('fully masks short values', () => {
    const result = maskValue15('abc');
    expect(result).toBe('***');
  });

  it('respects custom mask character', () => {
    const result = maskValue15('helloworld', { char: '#' });
    expect(result).toBe('he######ld');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue15('helloworld', { visibleStart: 3, visibleEnd: 3 });
    expect(result).toBe('hel****rld');
  });

  it('masks value at exactly minLength', () => {
    const result = maskValue15('abcdef', { minLength: 6 });
    expect(result).toBe('ab**ef');
  });

  it('fully masks value below minLength', () => {
    const result = maskValue15('ab', { minLength: 4 });
    expect(result).toBe('**');
  });
});

describe('maskEnv15', () => {
  const env = {
    API_KEY: 'supersecretkey',
    DB_PASS: 'password123',
    PORT: '3000',
  };

  it('masks specified keys', () => {
    const result = maskEnv15(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe(env['API_KEY']);
    expect(result.masked['DB_PASS']).not.toBe(env['DB_PASS']);
    expect(result.masked['PORT']).toBe('3000');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv15(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toEqual([]);
  });

  it('does not mutate original env', () => {
    maskEnv15(env, ['API_KEY']);
    expect(env['API_KEY']).toBe('supersecretkey');
  });
});

describe('formatMask15Result', () => {
  it('returns a message when no keys masked', () => {
    const result = formatMask15Result({ original: {}, masked: {}, maskedKeys: [] });
    expect(result).toBe('No keys masked.');
  });

  it('formats masked keys correctly', () => {
    const original = { SECRET: 'myvalue123' };
    const masked = { SECRET: 'my******23' };
    const output = formatMask15Result({ original, masked, maskedKeys: ['SECRET'] });
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
    expect(output).toContain('myvalue123');
    expect(output).toContain('my******23');
  });
});
