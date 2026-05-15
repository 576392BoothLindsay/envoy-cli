import { maskValue23, maskEnv23, formatMask23Result } from './envMask23';

describe('maskValue23', () => {
  it('masks middle characters with defaults', () => {
    expect(maskValue23('abcdefgh')).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    expect(maskValue23('abcdefgh', { char: '#' })).toBe('ab####gh');
  });

  it('respects visibleStart and visibleEnd', () => {
    expect(maskValue23('abcdefgh', { visibleStart: 1, visibleEnd: 1 })).toBe('a******h');
  });

  it('masks entirely when shorter than minLength', () => {
    expect(maskValue23('ab', { minLength: 4 })).toBe('**');
  });

  it('handles visibleEnd of 0', () => {
    expect(maskValue23('abcdef', { visibleStart: 2, visibleEnd: 0 })).toBe('ab****');
  });
});

describe('maskEnv23', () => {
  const env = { API_KEY: 'supersecret', PORT: '3000', TOKEN: 'mytoken123' };

  it('masks specified keys', () => {
    const result = maskEnv23(env, ['API_KEY', 'TOKEN']);
    expect(result.maskedKeys).toEqual(['API_KEY', 'TOKEN']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['PORT']).toBe('3000');
  });

  it('ignores keys not in env', () => {
    const result = maskEnv23(env, ['MISSING']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original', () => {
    const result = maskEnv23(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask23Result', () => {
  it('returns message when no keys masked', () => {
    const result = { original: {}, masked: {}, maskedKeys: [] };
    expect(formatMask23Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const env = { SECRET: 'hello_world' };
    const result = maskEnv23(env, ['SECRET']);
    const output = formatMask23Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
