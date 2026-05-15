import { maskValue25, maskEnv25, formatMask25Result } from './envMask25';

describe('maskValue25', () => {
  it('masks middle characters with defaults', () => {
    const result = maskValue25('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('uses custom mask character', () => {
    const result = maskValue25('abcdefgh', { char: '#' });
    expect(result).toBe('ab####gh');
  });

  it('respects visibleStart and visibleEnd', () => {
    const result = maskValue25('abcdefgh', { visibleStart: 1, visibleEnd: 1 });
    expect(result).toBe('a******h');
  });

  it('masks entire short value below minLength', () => {
    const result = maskValue25('ab', { minLength: 4 });
    expect(result).toBe('**');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue25('abcdef', { visibleStart: 2, visibleEnd: 0 });
    expect(result).toBe('ab****');
  });

  it('ensures at least one mask character in middle', () => {
    const result = maskValue25('abcd', { visibleStart: 2, visibleEnd: 2 });
    expect(result).toContain('*');
  });
});

describe('maskEnv25', () => {
  const env = { API_KEY: 'supersecret', PORT: '3000', DB_PASS: 'mypassword' };

  it('masks specified keys', () => {
    const result = maskEnv25(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('mypassword');
    expect(result.masked['PORT']).toBe('3000');
  });

  it('returns count of masked keys', () => {
    const result = maskEnv25(env, ['API_KEY']);
    expect(result.count).toBe(1);
  });

  it('does not mutate original env', () => {
    const copy = { ...env };
    maskEnv25(env, ['API_KEY']);
    expect(env).toEqual(copy);
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv25(env, ['MISSING_KEY']);
    expect(result.count).toBe(0);
  });
});

describe('formatMask25Result', () => {
  it('formats result with count and entries', () => {
    const result = maskEnv25({ SECRET: 'abc123' }, ['SECRET']);
    const output = formatMask25Result(result);
    expect(output).toContain('Masked 1 key(s).');
    expect(output).toContain('SECRET=');
  });
});
