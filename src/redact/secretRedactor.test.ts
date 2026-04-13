import { describe, it, expect } from 'vitest';
import { shouldRedact, redactEnv, getRedactedKeys } from './secretRedactor';

describe('shouldRedact', () => {
  it('should redact keys matching default patterns', () => {
    expect(shouldRedact('DB_PASSWORD')).toBe(true);
    expect(shouldRedact('API_SECRET')).toBe(true);
    expect(shouldRedact('AUTH_TOKEN')).toBe(true);
    expect(shouldRedact('API_KEY')).toBe(true);
    expect(shouldRedact('PRIVATE_KEY')).toBe(true);
  });

  it('should not redact non-sensitive keys', () => {
    expect(shouldRedact('APP_NAME')).toBe(false);
    expect(shouldRedact('PORT')).toBe(false);
    expect(shouldRedact('NODE_ENV')).toBe(false);
    expect(shouldRedact('BASE_URL')).toBe(false);
  });

  it('should redact custom keys regardless of pattern', () => {
    expect(shouldRedact('MY_CUSTOM_VAR', { customKeys: ['MY_CUSTOM_VAR'] })).toBe(true);
  });

  it('should use custom patterns when provided', () => {
    const options = { patterns: [/^SENSITIVE_/i] };
    expect(shouldRedact('SENSITIVE_DATA', options)).toBe(true);
    expect(shouldRedact('API_KEY', options)).toBe(false);
  });
});

describe('redactEnv', () => {
  const sampleEnv = {
    APP_NAME: 'my-app',
    DB_PASSWORD: 'supersecret',
    API_KEY: 'abc123',
    PORT: '3000',
    AUTH_TOKEN: 'token-xyz',
  };

  it('should redact sensitive values and preserve safe ones', () => {
    const result = redactEnv(sampleEnv);
    expect(result.APP_NAME).toBe('my-app');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe('**REDACTED**');
    expect(result.API_KEY).toBe('**REDACTED**');
    expect(result.AUTH_TOKEN).toBe('**REDACTED**');
  });

  it('should use a custom redacted value when specified', () => {
    const result = redactEnv(sampleEnv, { redactedValue: '[HIDDEN]' });
    expect(result.DB_PASSWORD).toBe('[HIDDEN]');
  });

  it('should not mutate the original env object', () => {
    redactEnv(sampleEnv);
    expect(sampleEnv.DB_PASSWORD).toBe('supersecret');
  });
});

describe('getRedactedKeys', () => {
  it('should return only keys that would be redacted', () => {
    const env = { APP_NAME: 'app', DB_PASSWORD: 'pass', PORT: '8080', API_SECRET: 'shh' };
    const keys = getRedactedKeys(env);
    expect(keys).toContain('DB_PASSWORD');
    expect(keys).toContain('API_SECRET');
    expect(keys).not.toContain('APP_NAME');
    expect(keys).not.toContain('PORT');
  });
});
