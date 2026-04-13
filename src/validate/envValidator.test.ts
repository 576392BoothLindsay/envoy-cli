import { validateEnv, validateRequiredKeys, formatValidationErrors } from './envValidator';
import { ParsedEnv } from '../parser/envParser';

describe('validateEnv', () => {
  const env: ParsedEnv = {
    DATABASE_URL: 'postgres://localhost:5432/db',
    API_KEY: 'abc123',
    PORT: '3000',
    EMPTY_VAR: '',
  };

  it('passes when all required keys are present', () => {
    const result = validateEnv(env, [{ key: 'DATABASE_URL', required: true }]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when a required key is missing', () => {
    const result = validateEnv(env, [{ key: 'SECRET_KEY', required: true }]);
    expect(result.valid).toBe(false);
    expect(result.errors[0].key).toBe('SECRET_KEY');
  });

  it('fails when a required key is empty', () => {
    const result = validateEnv(env, [{ key: 'EMPTY_VAR', required: true }]);
    expect(result.valid).toBe(false);
  });

  it('validates pattern match', () => {
    const result = validateEnv(env, [{ key: 'PORT', pattern: /^\d+$/ }]);
    expect(result.valid).toBe(true);
  });

  it('fails on pattern mismatch', () => {
    const result = validateEnv(env, [{ key: 'API_KEY', pattern: /^\d+$/ }]);
    expect(result.valid).toBe(false);
  });

  it('validates minLength', () => {
    const result = validateEnv(env, [{ key: 'API_KEY', minLength: 10 }]);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('at least 10');
  });

  it('validates maxLength', () => {
    const result = validateEnv(env, [{ key: 'DATABASE_URL', maxLength: 5 }]);
    expect(result.valid).toBe(false);
  });

  it('skips optional missing keys', () => {
    const result = validateEnv(env, [{ key: 'OPTIONAL_KEY', minLength: 3 }]);
    expect(result.valid).toBe(true);
  });
});

describe('validateRequiredKeys', () => {
  it('returns valid when all keys exist', () => {
    const env: ParsedEnv = { FOO: 'bar', BAZ: 'qux' };
    const result = validateRequiredKeys(env, ['FOO', 'BAZ']);
    expect(result.valid).toBe(true);
  });

  it('returns errors for missing keys', () => {
    const env: ParsedEnv = { FOO: 'bar' };
    const result = validateRequiredKeys(env, ['FOO', 'MISSING']);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
  });
});

describe('formatValidationErrors', () => {
  it('returns success message when valid', () => {
    const msg = formatValidationErrors({ valid: true, errors: [] });
    expect(msg).toBe('All validations passed.');
  });

  it('formats error messages', () => {
    const msg = formatValidationErrors({
      valid: false,
      errors: [{ key: 'FOO', message: '"FOO" is required but missing or empty' }],
    });
    expect(msg).toContain('✖');
    expect(msg).toContain('FOO');
  });
});
