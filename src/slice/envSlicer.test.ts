import { sliceEnv, sliceByCount, formatSliceResult } from './envSlicer';
import { EnvRecord } from '../parser/envParser';

const sampleEnv: EnvRecord = {
  APP_NAME: 'envoy',
  APP_ENV: 'production',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  API_KEY: 'secret',
  LOG_LEVEL: 'info',
};

describe('sliceEnv', () => {
  it('slices from start to end', () => {
    const result = sliceEnv(sampleEnv, 0, 3);
    expect(Object.keys(result.sliced)).toEqual(['APP_NAME', 'APP_ENV', 'DB_HOST']);
    expect(result.total).toBe(6);
    expect(result.start).toBe(0);
    expect(result.end).toBe(3);
  });

  it('slices from middle to end when end is omitted', () => {
    const result = sliceEnv(sampleEnv, 4);
    expect(Object.keys(result.sliced)).toEqual(['API_KEY', 'LOG_LEVEL']);
  });

  it('handles negative start index', () => {
    const result = sliceEnv(sampleEnv, -2);
    expect(Object.keys(result.sliced)).toEqual(['API_KEY', 'LOG_LEVEL']);
  });

  it('handles negative end index', () => {
    const result = sliceEnv(sampleEnv, 0, -3);
    expect(Object.keys(result.sliced)).toEqual(['APP_NAME', 'APP_ENV', 'DB_HOST']);
  });

  it('clamps start to 0 if out of bounds', () => {
    const result = sliceEnv(sampleEnv, -100);
    expect(Object.keys(result.sliced).length).toBe(6);
  });

  it('returns empty record for out-of-range start', () => {
    const result = sliceEnv(sampleEnv, 10);
    expect(Object.keys(result.sliced)).toHaveLength(0);
  });
});

describe('sliceByCount', () => {
  it('slices first N keys', () => {
    const result = sliceByCount(sampleEnv, 2, 'first');
    expect(Object.keys(result.sliced)).toEqual(['APP_NAME', 'APP_ENV']);
  });

  it('slices last N keys', () => {
    const result = sliceByCount(sampleEnv, 2, 'last');
    expect(Object.keys(result.sliced)).toEqual(['API_KEY', 'LOG_LEVEL']);
  });

  it('defaults to first', () => {
    const result = sliceByCount(sampleEnv, 1);
    expect(Object.keys(result.sliced)).toEqual(['APP_NAME']);
  });
});

describe('formatSliceResult', () => {
  it('formats result with header and entries', () => {
    const result = sliceEnv(sampleEnv, 0, 2);
    const output = formatSliceResult(result);
    expect(output).toContain('Sliced 2 of 6 keys');
    expect(output).toContain('APP_NAME=envoy');
    expect(output).toContain('APP_ENV=production');
  });

  it('shows correct index range', () => {
    const result = sliceEnv(sampleEnv, 2, 4);
    const output = formatSliceResult(result);
    expect(output).toContain('index 2–4');
  });
});
