import { sampleEnv, formatSampleResult } from './envSampler';
import { EnvRecord } from '../parser/envParser';

const env: EnvRecord = {
  API_KEY: 'abc123',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_ENV: 'production',
  SECRET: 'supersecret',
  LOG_LEVEL: 'info',
};

describe('sampleEnv', () => {
  it('returns half the keys by default', () => {
    const result = sampleEnv(env, { seed: 42 });
    expect(result.total).toBe(6);
    expect(result.selected).toBe(3);
    expect(result.skipped).toBe(3);
  });

  it('respects count option', () => {
    const result = sampleEnv(env, { count: 2, seed: 1 });
    expect(result.selected).toBe(2);
    expect(Object.keys(result.sampled)).toHaveLength(2);
  });

  it('clamps count to total keys', () => {
    const result = sampleEnv(env, { count: 100, seed: 1 });
    expect(result.selected).toBe(6);
    expect(result.skipped).toBe(0);
  });

  it('uses specific keys when provided', () => {
    const result = sampleEnv(env, { keys: ['API_KEY', 'DB_HOST'] });
    expect(result.selected).toBe(2);
    expect(result.sampled).toHaveProperty('API_KEY', 'abc123');
    expect(result.sampled).toHaveProperty('DB_HOST', 'localhost');
  });

  it('ignores keys not present in env', () => {
    const result = sampleEnv(env, { keys: ['API_KEY', 'NONEXISTENT'] });
    expect(result.selected).toBe(1);
    expect(result.sampled).toHaveProperty('API_KEY');
  });

  it('is deterministic with same seed', () => {
    const r1 = sampleEnv(env, { count: 3, seed: 99 });
    const r2 = sampleEnv(env, { count: 3, seed: 99 });
    expect(Object.keys(r1.sampled)).toEqual(Object.keys(r2.sampled));
  });

  it('preserves original reference', () => {
    const result = sampleEnv(env, { seed: 7 });
    expect(result.original).toBe(env);
  });
});

describe('formatSampleResult', () => {
  it('formats result with header and entries', () => {
    const result = sampleEnv(env, { keys: ['API_KEY', 'LOG_LEVEL'] });
    const output = formatSampleResult(result);
    expect(output).toContain('Sampled 2 of 6 keys');
    expect(output).toContain('API_KEY=abc123');
    expect(output).toContain('LOG_LEVEL=info');
  });

  it('shows skipped count', () => {
    const result = sampleEnv(env, { keys: ['DB_PORT'] });
    const output = formatSampleResult(result);
    expect(output).toContain('5 skipped');
  });
});
