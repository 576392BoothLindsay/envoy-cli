import { summarizeEnv, formatSummaryResult } from './envSummarizer';

describe('summarizeEnv', () => {
  it('returns zeros for empty env', () => {
    const result = summarizeEnv({});
    expect(result.totalKeys).toBe(0);
    expect(result.emptyValues).toBe(0);
    expect(result.nonEmptyValues).toBe(0);
    expect(result.uniqueValues).toBe(0);
    expect(result.duplicateValues).toBe(0);
    expect(result.longestKey).toBe('');
    expect(result.longestValue).toBe('');
    expect(result.averageValueLength).toBe(0);
  });

  it('counts total keys correctly', () => {
    const result = summarizeEnv({ A: '1', B: '2', C: '3' });
    expect(result.totalKeys).toBe(3);
  });

  it('identifies empty values', () => {
    const result = summarizeEnv({ A: '', B: 'hello', C: '' });
    expect(result.emptyValues).toBe(2);
    expect(result.nonEmptyValues).toBe(1);
  });

  it('counts unique and duplicate values', () => {
    const result = summarizeEnv({ A: 'x', B: 'x', C: 'y' });
    expect(result.uniqueValues).toBe(2);
    expect(result.duplicateValues).toBe(1);
  });

  it('finds the longest key', () => {
    const result = summarizeEnv({ SHORT: 'a', VERY_LONG_KEY_NAME: 'b' });
    expect(result.longestKey).toBe('VERY_LONG_KEY_NAME');
  });

  it('finds the longest value', () => {
    const result = summarizeEnv({ A: 'hi', B: 'a much longer value here' });
    expect(result.longestValue).toBe('a much longer value here');
  });

  it('calculates average value length', () => {
    const result = summarizeEnv({ A: 'ab', B: 'abcd' });
    expect(result.averageValueLength).toBe(3);
  });

  it('groups keys by prefix', () => {
    const result = summarizeEnv({
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      APP_NAME: 'myapp',
      NOPREFIX: 'val',
    });
    expect(result.prefixes['DB']).toBe(2);
    expect(result.prefixes['APP']).toBe(1);
    expect(result.prefixes['NOPREFIX']).toBeUndefined();
  });
});

describe('formatSummaryResult', () => {
  it('formats a summary result as a readable string', () => {
    const result = summarizeEnv({ DB_HOST: 'localhost', DB_PORT: '5432', SECRET: '' });
    const output = formatSummaryResult(result);
    expect(output).toContain('Total keys:');
    expect(output).toContain('3');
    expect(output).toContain('Empty values:');
    expect(output).toContain('DB_');
  });

  it('handles env with no prefixed keys', () => {
    const result = summarizeEnv({ FOO: 'bar' });
    const output = formatSummaryResult(result);
    expect(output).not.toContain('Key prefixes:');
  });
});
