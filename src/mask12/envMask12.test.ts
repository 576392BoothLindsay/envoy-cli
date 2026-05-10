import { maskValue12, maskEnv12, formatMask12Result } from './envMask12';

describe('maskValue12', () => {
  it('masks middle of a long value', () => {
    expect(maskValue12('abcdefgh')).toBe('ab****gh');
  });

  it('fully masks short values below minLength', () => {
    expect(maskValue12('abc')).toBe('***');
  });

  it('respects custom char', () => {
    expect(maskValue12('abcdefgh', { char: '#' })).toBe('ab####gh');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    expect(maskValue12('abcdefgh', { visibleStart: 1, visibleEnd: 1 })).toBe('a******h');
  });

  it('handles visibleEnd of 0', () => {
    expect(maskValue12('abcdefgh', { visibleEnd: 0 })).toBe('ab******');
  });
});

describe('maskEnv12', () => {
  const env = { API_KEY: 'supersecret', HOST: 'localhost', TOKEN: 'tok123' };

  it('masks specified keys', () => {
    const result = maskEnv12(env, ['API_KEY', 'TOKEN']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['TOKEN']).not.toBe('tok123');
    expect(result.masked['HOST']).toBe('localhost');
    expect(result.maskedKeys).toEqual(['API_KEY', 'TOKEN']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv12(env, ['MISSING']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    maskEnv12(env, ['API_KEY']);
    expect(env['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask12Result', () => {
  it('returns message when no keys masked', () => {
    const result = { original: {}, masked: {}, maskedKeys: [] };
    expect(formatMask12Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const env = { SECRET: 'password123' };
    const result = maskEnv12(env, ['SECRET']);
    const output = formatMask12Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
