import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('secret123')).toBe('*********');
  });

  it('uses custom mask character', () => {
    expect(maskValue('hello', { char: '#' })).toBe('#####');
  });

  it('preserves visible trailing characters', () => {
    expect(maskValue('secret123', { visibleChars: 3 })).toBe('******123');
  });

  it('masks short values fully regardless of visibleChars', () => {
    expect(maskValue('ab', { visibleChars: 3, minLength: 3 })).toBe('**');
  });

  it('masks value shorter than minLength fully', () => {
    expect(maskValue('hi', { minLength: 5 })).toBe('**');
  });
});

describe('maskEnv', () => {
  const env = { API_KEY: 'supersecret', HOST: 'localhost', TOKEN: 'abc123' };

  it('masks specified keys', () => {
    const result = maskEnv(env, ['API_KEY', 'TOKEN']);
    expect(result.masked['API_KEY']).toBe('***********');
    expect(result.masked['TOKEN']).toBe('******');
    expect(result.masked['HOST']).toBe('localhost');
  });

  it('tracks masked keys', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });

  it('applies options to all masked keys', () => {
    const result = maskEnv(env, ['API_KEY', 'TOKEN'], { visibleChars: 2 });
    expect(result.masked['API_KEY']).toBe('*********et');
    expect(result.masked['TOKEN']).toBe('****23');
  });
});

describe('formatMaskResult', () => {
  it('formats result with masked keys', () => {
    const env = { SECRET: 'password' };
    const result = maskEnv(env, ['SECRET']);
    const output = formatMaskResult(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('SECRET');
    expect(output).toContain('password');
    expect(output).toContain('********');
  });

  it('shows no keys matched when empty', () => {
    const result = maskEnv({}, ['NONE']);
    const output = formatMaskResult(result);
    expect(output).toContain('no keys matched');
  });
});
