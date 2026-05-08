import { maskValue9, maskEnv9, formatMask9Result } from './envMask9';

describe('maskValue9', () => {
  it('masks middle of value with defaults', () => {
    const result = maskValue9('secretvalue');
    expect(result).toBe('se*******ue');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue9('abc');
    expect(result).toBe('***');
  });

  it('respects custom char', () => {
    const result = maskValue9('helloworld', { char: '#' });
    expect(result).toBe('he######ld');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue9('password123', { visibleStart: 3, visibleEnd: 3 });
    expect(result).toBe('pas*****123');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue9('mytoken', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('my*****');
  });

  it('masks exactly at minLength boundary', () => {
    const result = maskValue9('abcd', { minLength: 4 });
    expect(result).toBe('ab**');
  });
});

describe('maskEnv9', () => {
  const env = { API_KEY: 'supersecret', NAME: 'Alice', TOKEN: 'tok123' };

  it('masks specified keys', () => {
    const result = maskEnv9(env, ['API_KEY', 'TOKEN']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'TOKEN']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['NAME']).toBe('Alice');
  });

  it('ignores keys not in env', () => {
    const result = maskEnv9(env, ['MISSING']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original record', () => {
    const result = maskEnv9(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });

  it('applies options to all masked keys', () => {
    const result = maskEnv9(env, ['API_KEY'], { char: '-', visibleStart: 1, visibleEnd: 1 });
    expect(result.masked['API_KEY']).toMatch(/^s-+t$/);
  });
});

describe('formatMask9Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv9({ FOO: 'bar' }, []);
    expect(formatMask9Result(result)).toBe('No keys masked.');
  });

  it('lists masked keys and values', () => {
    const env = { SECRET: 'abcdefgh' };
    const result = maskEnv9(env, ['SECRET']);
    const output = formatMask9Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
