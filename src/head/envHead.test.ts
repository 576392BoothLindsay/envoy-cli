import { headEnv, headByPrefix, formatHeadResult } from './envHead';

const sample = {
  APP_NAME: 'envoy',
  APP_ENV: 'production',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

describe('headEnv', () => {
  it('returns the first n entries', () => {
    const result = headEnv(sample, 2);
    expect(result.taken).toBe(2);
    expect(Object.keys(result.entries)).toEqual(['APP_NAME', 'APP_ENV']);
  });

  it('returns all entries when n exceeds total', () => {
    const result = headEnv(sample, 100);
    expect(result.taken).toBe(5);
    expect(result.total).toBe(5);
  });

  it('returns empty entries when n is 0', () => {
    const result = headEnv(sample, 0);
    expect(result.taken).toBe(0);
    expect(Object.keys(result.entries)).toHaveLength(0);
  });

  it('throws on negative n', () => {
    expect(() => headEnv(sample, -1)).toThrow(RangeError);
  });

  it('sets total correctly', () => {
    const result = headEnv(sample, 3);
    expect(result.total).toBe(5);
  });
});

describe('headByPrefix', () => {
  it('groups and returns first n entries per prefix', () => {
    const result = headByPrefix(sample, 1);
    expect(Object.keys(result.APP)).toEqual(['APP_NAME']);
    expect(Object.keys(result.DB)).toEqual(['DB_HOST']);
    expect(Object.keys(result.SECRET)).toEqual(['SECRET_KEY']);
  });

  it('returns up to n per group', () => {
    const result = headByPrefix(sample, 2);
    expect(Object.keys(result.APP)).toHaveLength(2);
    expect(Object.keys(result.DB)).toHaveLength(2);
  });
});

describe('formatHeadResult', () => {
  it('formats result with header and key=value lines', () => {
    const result = headEnv(sample, 2);
    const output = formatHeadResult(result);
    expect(output).toContain('# Showing 2 of 5 entries');
    expect(output).toContain('APP_NAME=envoy');
    expect(output).toContain('APP_ENV=production');
  });

  it('shows 0 taken correctly', () => {
    const result = headEnv(sample, 0);
    const output = formatHeadResult(result);
    expect(output).toContain('# Showing 0 of 5 entries');
  });
});
