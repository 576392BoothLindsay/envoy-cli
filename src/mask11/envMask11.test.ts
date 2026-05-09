import { maskValue11, maskEnv11, formatMask11Result } from './envMask11';

describe('maskValue11', () => {
  it('masks middle characters with defaults', () => {
    const result = maskValue11('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue11('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('respects visibleStart and visibleEnd', () => {
    const result = maskValue11('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('masks entirely when value is shorter than minLength', () => {
    const result = maskValue11('ab', { minLength: 4 });
    expect(result).toBe('**');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue11('abcdef', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('ab****');
  });
});

describe('maskEnv11', () => {
  const env = { API_KEY: 'supersecret', DB_HOST: 'localhost', TOKEN: 'abc' };

  it('masks specified keys', () => {
    const result = maskEnv11(env, ['API_KEY', 'TOKEN']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_HOST']).toBe('localhost');
    expect(result.maskedKeys).toEqual(['API_KEY', 'TOKEN']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv11(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv11(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask11Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv11({}, []);
    expect(formatMask11Result(result)).toBe('No keys masked.');
  });

  it('returns formatted output for masked keys', () => {
    const env = { SECRET: 'hello123' };
    const result = maskEnv11(env, ['SECRET']);
    const output = formatMask11Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
