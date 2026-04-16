import { checkRequired, formatRequiredResult } from './envRequired';

describe('checkRequired', () => {
  const env = { API_KEY: 'abc', DB_HOST: 'localhost', EMPTY_KEY: '' };

  it('returns valid when all required keys present', () => {
    const result = checkRequired(env, ['API_KEY', 'DB_HOST']);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.present).toEqual(['API_KEY', 'DB_HOST']);
  });

  it('detects missing keys', () => {
    const result = checkRequired(env, ['API_KEY', 'SECRET']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('SECRET');
    expect(result.present).toContain('API_KEY');
  });

  it('treats empty string values as missing', () => {
    const result = checkRequired(env, ['EMPTY_KEY']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('EMPTY_KEY');
  });

  it('returns correct totals', () => {
    const result = checkRequired(env, ['API_KEY', 'DB_HOST', 'MISSING']);
    expect(result.total).toBe(3);
    expect(result.present).toHaveLength(2);
    expect(result.missing).toHaveLength(1);
  });

  it('handles empty required list', () => {
    const result = checkRequired(env, []);
    expect(result.valid).toBe(true);
    expect(result.total).toBe(0);
  });
});

describe('formatRequiredResult', () => {
  it('formats valid result', () => {
    const result = checkRequired({ FOO: 'bar' }, ['FOO']);
    const output = formatRequiredResult(result);
    expect(output).toContain('✔ All 1 required key(s) are present.');
  });

  it('formats invalid result with missing keys', () => {
    const result = checkRequired({}, ['FOO', 'BAR']);
    const output = formatRequiredResult(result);
    expect(output).toContain('✖ 2 of 2 required key(s) missing:');
    expect(output).toContain('- FOO');
    expect(output).toContain('- BAR');
  });
});
