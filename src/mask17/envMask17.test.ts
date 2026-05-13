import { maskValue17, maskEnv17, formatMask17Result } from './envMask17';

describe('maskValue17', () => {
  it('masks middle characters with defaults', () => {
    const result = maskValue17('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue17('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue17('abc');
    expect(result).toBe('***');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue17('hello_world', { visibleStart: 3, visibleEnd: 3 });
    expect(result).toBe('hel*****rld');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue17('abcdefgh', { visibleEnd: 0 });
    expect(result).toBe('ab******');
  });
});

describe('maskEnv17', () => {
  const env = { API_KEY: 'supersecret', HOST: 'localhost', TOKEN: 'mytoken123' };

  it('masks specified keys', () => {
    const result = maskEnv17(env, ['API_KEY', 'TOKEN']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['TOKEN']).not.toBe('mytoken123');
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('tracks masked keys', () => {
    const result = maskEnv17(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv17(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv17(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask17Result', () => {
  it('returns message when no keys masked', () => {
    const result = maskEnv17({ A: '1' }, []);
    expect(formatMask17Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const result = maskEnv17({ API_KEY: 'supersecret' }, ['API_KEY']);
    const output = formatMask17Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('API_KEY');
  });
});
