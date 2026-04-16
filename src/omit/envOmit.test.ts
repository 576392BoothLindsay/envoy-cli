import { omitKeys, omitByPattern, buildOmitResult, formatOmitResult } from './envOmit';

const env = {
  APP_NAME: 'myapp',
  APP_SECRET: 'secret',
  DB_HOST: 'localhost',
  DB_PASS: 'pass',
};

describe('omitKeys', () => {
  it('removes specified keys', () => {
    const result = omitKeys(env, ['APP_SECRET', 'DB_PASS']);
    expect(result).toEqual({ APP_NAME: 'myapp', DB_HOST: 'localhost' });
  });

  it('returns all keys when none match', () => {
    const result = omitKeys(env, ['MISSING']);
    expect(result).toEqual(env);
  });

  it('returns empty object when all keys omitted', () => {
    const result = omitKeys(env, Object.keys(env));
    expect(result).toEqual({});
  });
});

describe('omitByPattern', () => {
  it('removes keys matching pattern', () => {
    const result = omitByPattern(env, /^DB_/);
    expect(result).toEqual({ APP_NAME: 'myapp', APP_SECRET: 'secret' });
  });

  it('returns all keys when pattern matches nothing', () => {
    const result = omitByPattern(env, /^XYZ_/);
    expect(result).toEqual(env);
  });
});

describe('buildOmitResult', () => {
  it('tracks omitted keys correctly', () => {
    const r = buildOmitResult(env, ['APP_SECRET', 'MISSING']);
    expect(r.omitted).toEqual(['APP_SECRET']);
    expect(r.result).not.toHaveProperty('APP_SECRET');
  });
});

describe('formatOmitResult', () => {
  it('shows omitted keys', () => {
    const r = buildOmitResult(env, ['APP_SECRET']);
    const out = formatOmitResult(r);
    expect(out).toContain('APP_SECRET');
    expect(out).toContain('Remaining keys: 3');
  });

  it('shows no keys omitted message', () => {
    const r = buildOmitResult(env, []);
    const out = formatOmitResult(r);
    expect(out).toContain('No keys omitted.');
  });
});
