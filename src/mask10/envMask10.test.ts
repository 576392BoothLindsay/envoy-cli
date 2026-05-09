import { maskValue10, maskEnv10, formatMask10Result } from './envMask10';

describe('maskValue10', () => {
  it('masks a value with default options', () => {
    const result = maskValue10('mysecretvalue');
    expect(result).toBe('my*********ue');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue10('ab');
    expect(result).toBe('**');
  });

  it('uses custom mask character', () => {
    const result = maskValue10('hello', { char: '#' });
    expect(result).toBe('he#lo');
  });

  it('uses custom visibleStart and visibleEnd', () => {
    const result = maskValue10('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue10('hello', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('he***');
  });

  it('uses custom minLength', () => {
    const result = maskValue10('abc', { minLength: 2 });
    expect(result).toBe('a*c');
  });
});

describe('maskEnv10', () => {
  const env = { API_KEY: 'supersecret', DB_PASS: 'p4ssw0rd', HOST: 'localhost' };

  it('masks specified keys', () => {
    const result = maskEnv10(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('p4ssw0rd');
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('tracks masked keys', () => {
    const result = maskEnv10(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv10(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    const original = { SECRET: 'value123' };
    maskEnv10(original, ['SECRET']);
    expect(original['SECRET']).toBe('value123');
  });
});

describe('formatMask10Result', () => {
  it('returns no-op message when nothing masked', () => {
    const result = maskEnv10({ HOST: 'localhost' }, []);
    expect(formatMask10Result(result)).toBe('No keys were masked.');
  });

  it('formats masked keys summary', () => {
    const result = maskEnv10({ API_KEY: 'supersecret' }, ['API_KEY']);
    const output = formatMask10Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('API_KEY');
  });
});
