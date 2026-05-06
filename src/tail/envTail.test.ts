import { tailEnv, tailByPrefix, formatTailResult } from './envTail';

const sampleEnv = {
  APP_NAME: 'envoy',
  APP_ENV: 'production',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

describe('tailEnv', () => {
  it('returns the last n entries', () => {
    const result = tailEnv(sampleEnv, 2);
    expect(result.taken).toBe(2);
    expect(result.total).toBe(5);
    expect(Object.keys(result.entries)).toEqual(['DB_PORT', 'SECRET_KEY']);
  });

  it('returns all entries when n >= total', () => {
    const result = tailEnv(sampleEnv, 10);
    expect(result.taken).toBe(5);
    expect(result.total).toBe(5);
  });

  it('returns empty when n is 0', () => {
    const result = tailEnv(sampleEnv, 0);
    expect(result.taken).toBe(0);
    expect(Object.keys(result.entries)).toHaveLength(0);
  });

  it('handles negative n as 0', () => {
    const result = tailEnv(sampleEnv, -3);
    expect(result.taken).toBe(0);
  });

  it('handles empty env', () => {
    const result = tailEnv({}, 5);
    expect(result.taken).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('tailByPrefix', () => {
  it('returns last n entries matching prefix', () => {
    const result = tailByPrefix(sampleEnv, 'DB_', 1);
    expect(result.taken).toBe(1);
    expect(Object.keys(result.entries)).toEqual(['DB_PORT']);
  });

  it('returns empty when prefix has no matches', () => {
    const result = tailByPrefix(sampleEnv, 'REDIS_', 3);
    expect(result.taken).toBe(0);
  });
});

describe('formatTailResult', () => {
  it('formats result correctly', () => {
    const result = tailEnv(sampleEnv, 2);
    const output = formatTailResult(result);
    expect(output).toContain('Showing last 2 of 5 keys:');
    expect(output).toContain('DB_PORT=5432');
    expect(output).toContain('SECRET_KEY=abc123');
  });

  it('formats empty result', () => {
    const result = tailEnv({}, 5);
    const output = formatTailResult(result);
    expect(output).toContain('Showing last 0 of 0 keys:');
  });
});
