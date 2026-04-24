import { maskValue, maskEnv, formatMaskResult } from './envMasker';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('secret123')).toBe('*********');
  });

  it('uses custom mask character', () => {
    expect(maskValue('hello', { char: '#' })).toBe('#####');
  });

  it('shows visible start characters', () => {
    expect(maskValue('secret123', { visibleStart: 2 })).toBe('se*******');
  });

  it('shows visible end characters', () => {
    expect(maskValue('secret123', { visibleEnd: 3 })).toBe('******123');
  });

  it('shows both start and end characters', () => {
    expect(maskValue('secret123', { visibleStart: 2, visibleEnd: 3 })).toBe('se****123');
  });

  it('masks short values entirely when below minLength', () => {
    expect(maskValue('ab', { minLength: 4 })).toBe('**');
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });

  it('handles single character', () => {
    expect(maskValue('x')).toBe('*');
  });
});

describe('maskEnv', () => {
  const env = {
    API_KEY: 'supersecret',
    DB_PASS: 'password123',
    APP_NAME: 'myapp',
  };

  it('masks specified keys', () => {
    const result = maskEnv(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).toBe('***********');
    expect(result.masked['DB_PASS']).toBe('***********');
    expect(result.masked['APP_NAME']).toBe('myapp');
  });

  it('records which keys were masked', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env unchanged', () => {
    const result = maskEnv(env, ['API_KEY']);
    expect(result.original).toEqual(env);
  });

  it('applies options to all masked keys', () => {
    const result = maskEnv(env, ['API_KEY'], { visibleStart: 3 });
    expect(result.masked['API_KEY']).toBe('sup********');
  });
});

describe('formatMaskResult', () => {
  it('reports no keys masked when none match', () => {
    const env = { FOO: 'bar' };
    const result = maskEnv(env, []);
    expect(formatMaskResult(result)).toBe('No keys were masked.');
  });

  it('lists all masked keys with before/after values', () => {
    const env = { SECRET: 'abc123' };
    const result = maskEnv(env, ['SECRET']);
    const output = formatMaskResult(result);
    expect(output).toContain('Masked 1 key(s):');
    expect(output).toContain('SECRET');
    expect(output).toContain('abc123');
    expect(output).toContain('→');
  });
});
