import { maskValue27, maskEnv27, formatMask27Result } from './envMask27';

describe('maskValue27', () => {
  it('masks a value showing start and end', () => {
    expect(maskValue27('abcdefgh')).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    expect(maskValue27('abcdefgh', { char: '#' })).toBe('ab####gh');
  });

  it('masks fully when value is shorter than minLength', () => {
    expect(maskValue27('ab', { minLength: 4 })).toBe('**');
  });

  it('respects visibleStart and visibleEnd', () => {
    expect(maskValue27('hello_world', { visibleStart: 3, visibleEnd: 3 })).toBe('hel*****rld');
  });

  it('handles visibleEnd of 0', () => {
    expect(maskValue27('abcdef', { visibleEnd: 0 })).toBe('ab****');
  });
});

describe('maskEnv27', () => {
  const env = {
    API_KEY: 'supersecret',
    DB_PASS: 'password123',
    APP_NAME: 'envoy',
  };

  it('masks specified keys', () => {
    const result = maskEnv27(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('password123');
    expect(result.masked['APP_NAME']).toBe('envoy');
    expect(result.maskedKeys).toEqual(['API_KEY', 'DB_PASS']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv27(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original', () => {
    const copy = { ...env };
    maskEnv27(env, ['API_KEY']);
    expect(env).toEqual(copy);
  });
});

describe('formatMask27Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv27({ A: '1' }, []);
    expect(formatMask27Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const result = maskEnv27({ SECRET: 'abc123' }, ['SECRET']);
    const output = formatMask27Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
