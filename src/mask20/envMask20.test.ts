import { maskValue20, maskEnv20, formatMask20Result } from './envMask20';

describe('maskValue20', () => {
  it('masks middle characters by default', () => {
    const result = maskValue20('abcdefgh');
    expect(result).toBe('ab****gh');
  });

  it('fully masks short values below minLength', () => {
    const result = maskValue20('abc');
    expect(result).toBe('***');
  });

  it('respects custom char', () => {
    const result = maskValue20('hello123', { char: '#' });
    expect(result).toBe('he####23');
  });

  it('respects custom visibleStart and visibleEnd', () => {
    const result = maskValue20('secretvalue', { visibleStart: 3, visibleEnd: 3 });
    expect(result).toBe('sec*****lue');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue20('password', { visibleEnd: 0 });
    expect(result).toBe('pa******');
  });

  it('uses at least one mask character', () => {
    const result = maskValue20('abcd', { visibleStart: 2, visibleEnd: 2 });
    expect(result).toBe('ab**cd');
  });
});

describe('maskEnv20', () => {
  const env = {
    API_KEY: 'supersecret',
    DB_PASS: 'mypassword',
    APP_NAME: 'envoy',
  };

  it('masks specified keys', () => {
    const result = maskEnv20(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).not.toBe('supersecret');
    expect(result.masked['DB_PASS']).not.toBe('mypassword');
    expect(result.masked['APP_NAME']).toBe('envoy');
  });

  it('records maskedKeys', () => {
    const result = maskEnv20(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('does not modify original env', () => {
    const result = maskEnv20(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });

  it('ignores keys not present in env', () => {
    const result = maskEnv20(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toEqual([]);
  });

  it('passes options to maskValue20', () => {
    const result = maskEnv20(env, ['API_KEY'], { char: '-', visibleStart: 1, visibleEnd: 1 });
    expect(result.masked['API_KEY']).toMatch(/^s-+t$/);
  });
});

describe('formatMask20Result', () => {
  it('returns message when no keys masked', () => {
    const result = formatMask20Result({ original: {}, masked: {}, maskedKeys: [] });
    expect(result).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const env = { SECRET: 'value123' };
    const result = maskEnv20(env, ['SECRET']);
    const output = formatMask20Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
  });
});
