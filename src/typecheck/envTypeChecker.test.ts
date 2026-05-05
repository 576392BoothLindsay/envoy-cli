import { typecheckEnv, checkType, formatTypecheckResult } from './envTypeChecker';

describe('checkType', () => {
  it('returns null for valid number', () => {
    expect(checkType('PORT', '3000', { type: 'number' })).toBeNull();
  });

  it('returns violation for invalid number', () => {
    const result = checkType('PORT', 'abc', { type: 'number' });
    expect(result).not.toBeNull();
    expect(result?.expectedType).toBe('number');
  });

  it('returns null for valid boolean', () => {
    expect(checkType('DEBUG', 'true', { type: 'boolean' })).toBeNull();
    expect(checkType('DEBUG', 'false', { type: 'boolean' })).toBeNull();
    expect(checkType('DEBUG', '1', { type: 'boolean' })).toBeNull();
  });

  it('returns violation for invalid boolean', () => {
    const result = checkType('DEBUG', 'maybe', { type: 'boolean' });
    expect(result).not.toBeNull();
  });

  it('validates url type', () => {
    expect(checkType('API', 'https://example.com', { type: 'url' })).toBeNull();
    expect(checkType('API', 'not-a-url', { type: 'url' })).not.toBeNull();
  });

  it('validates email type', () => {
    expect(checkType('EMAIL', 'user@example.com', { type: 'email' })).toBeNull();
    expect(checkType('EMAIL', 'bad-email', { type: 'email' })).not.toBeNull();
  });

  it('validates integer type', () => {
    expect(checkType('COUNT', '42', { type: 'integer' })).toBeNull();
    expect(checkType('COUNT', '3.14', { type: 'integer' })).not.toBeNull();
  });
});

describe('typecheckEnv', () => {
  const schema = {
    PORT: { type: 'number' as const },
    DEBUG: { type: 'boolean' as const },
    API_URL: { type: 'url' as const },
    OPTIONAL_KEY: { type: 'string' as const, optional: true },
  };

  it('returns valid when all keys pass', () => {
    const env = { PORT: '8080', DEBUG: 'true', API_URL: 'https://api.example.com' };
    const result = typecheckEnv(env, schema);
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.checkedCount).toBe(3);
  });

  it('detects type violations', () => {
    const env = { PORT: 'not-a-port', DEBUG: 'true', API_URL: 'https://api.example.com' };
    const result = typecheckEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.violations[0].key).toBe('PORT');
  });

  it('reports missing required keys', () => {
    const env = { DEBUG: 'true' };
    const result = typecheckEnv(env, schema);
    expect(result.valid).toBe(false);
    const keys = result.violations.map((v) => v.key);
    expect(keys).toContain('PORT');
    expect(keys).toContain('API_URL');
  });

  it('ignores missing optional keys', () => {
    const env = { PORT: '3000', DEBUG: 'false', API_URL: 'http://localhost' };
    const result = typecheckEnv(env, schema);
    expect(result.valid).toBe(true);
  });
});

describe('formatTypecheckResult', () => {
  it('formats a passing result', () => {
    const result = { valid: true, violations: [], checkedCount: 5 };
    expect(formatTypecheckResult(result)).toContain('5 checked keys passed');
  });

  it('formats violations', () => {
    const result = {
      valid: false,
      violations: [{ key: 'PORT', value: 'abc', expectedType: 'number', reason: 'Value "abc" is not a valid number' }],
      checkedCount: 1,
    };
    const output = formatTypecheckResult(result);
    expect(output).toContain('[PORT]');
    expect(output).toContain('1 type violation');
  });
});
