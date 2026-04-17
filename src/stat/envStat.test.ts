import { statEnv, formatStatResult } from './envStat';

describe('statEnv', () => {
  it('returns zeros for empty env', () => {
    const result = statEnv({});
    expect(result.total).toBe(0);
    expect(result.empty).toBe(0);
    expect(result.filled).toBe(0);
  });

  it('counts total keys', () => {
    const result = statEnv({ A: '1', B: '2', C: '3' });
    expect(result.total).toBe(3);
  });

  it('counts empty values', () => {
    const result = statEnv({ A: '', B: 'hello', C: '' });
    expect(result.empty).toBe(2);
    expect(result.filled).toBe(1);
  });

  it('counts redacted values', () => {
    const result = statEnv({ A: '***', B: '[REDACTED]', C: 'plain' });
    expect(result.redacted).toBe(2);
  });

  it('groups keys by prefix', () => {
    const result = statEnv({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'test' });
    expect(result.prefixes['DB']).toBe(2);
    expect(result.prefixes['APP']).toBe(1);
  });

  it('calculates average value length', () => {
    const result = statEnv({ A: 'ab', B: 'abcd' });
    expect(result.avgValueLength).toBe(3);
  });

  it('identifies longest and shortest keys', () => {
    const result = statEnv({ AB: '1', ABCDEF: '2', ABC: '3' });
    expect(result.longestKey).toBe('ABCDEF');
    expect(result.shortestKey).toBe('AB');
  });

  it('does not count keys without underscore as prefixed', () => {
    const result = statEnv({ HOST: 'localhost', PORT: '3000' });
    expect(Object.keys(result.prefixes).length).toBe(0);
  });
});

describe('formatStatResult', () => {
  it('returns a formatted string', () => {
    const stat = statEnv({ DB_HOST: 'localhost', DB_PORT: '5432', SECRET: '***' });
    const output = formatStatResult(stat);
    expect(output).toContain('Total keys');
    expect(output).toContain('Redacted');
    expect(output).toContain('DB_*');
  });

  it('omits prefixes section when no prefixed keys', () => {
    const stat = statEnv({ HOST: 'localhost' });
    const output = formatStatResult(stat);
    expect(output).not.toContain('Prefixes:');
  });
});
