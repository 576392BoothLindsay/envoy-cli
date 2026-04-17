import { truncateValue, truncateEnv, formatTruncateResult } from './envTruncator';

describe('truncateValue', () => {
  it('returns value unchanged if within limit', () => {
    expect(truncateValue('hello', 10)).toBe('hello');
  });

  it('truncates with default suffix', () => {
    expect(truncateValue('hello world', 8)).toBe('hello...');
  });

  it('truncates with custom suffix', () => {
    expect(truncateValue('hello world', 7, '--')).toBe('hello--');
  });
});

describe('truncateEnv', () => {
  const env = { SHORT: 'hi', LONG: 'a'.repeat(50), OTHER: 'b'.repeat(30) };

  it('truncates all long values by default', () => {
    const result = truncateEnv(env, { maxLength: 20 });
    expect(result.truncated.SHORT).toBe('hi');
    expect(result.truncated.LONG.length).toBe(20);
    expect(result.truncated.OTHER.length).toBe(20);
    expect(result.affectedKeys).toEqual(['LONG', 'OTHER']);
  });

  it('truncates only specified keys', () => {
    const result = truncateEnv(env, { maxLength: 20, keys: ['LONG'] });
    expect(result.truncated.LONG.length).toBe(20);
    expect(result.truncated.OTHER).toBe(env.OTHER);
    expect(result.affectedKeys).toEqual(['LONG']);
  });

  it('returns empty affectedKeys when nothing truncated', () => {
    const result = truncateEnv({ A: 'short' }, { maxLength: 100 });
    expect(result.affectedKeys).toHaveLength(0);
  });
});

describe('formatTruncateResult', () => {
  it('returns message when nothing truncated', () => {
    const result = truncateEnv({ A: 'hi' }, { maxLength: 100 });
    expect(formatTruncateResult(result)).toBe('No values needed truncation.');
  });

  it('includes affected key info', () => {
    const result = truncateEnv({ LONG: 'a'.repeat(20) }, { maxLength: 10 });
    const output = formatTruncateResult(result);
    expect(output).toContain('LONG');
    expect(output).toContain('before:');
    expect(output).toContain('after:');
  });
});
