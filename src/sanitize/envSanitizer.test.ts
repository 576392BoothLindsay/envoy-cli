import { sanitizeValue, sanitizeEnv, formatSanitizeResult } from './envSanitizer';

describe('sanitizeValue', () => {
  it('trims whitespace by default', () => {
    expect(sanitizeValue('  hello  ')).toBe('hello');
  });

  it('strips control characters by default', () => {
    expect(sanitizeValue('hello\x00world')).toBe('helloworld');
    expect(sanitizeValue('foo\x1Fbar')).toBe('foobar');
  });

  it('preserves newlines (\n is not stripped)', () => {
    expect(sanitizeValue('line1\nline2')).toBe('line1\nline2');
  });

  it('truncates to maxLength', () => {
    expect(sanitizeValue('abcdef', { maxLength: 3 })).toBe('abc');
  });

  it('skips trimming when disabled', () => {
    expect(sanitizeValue('  hi  ', { trimWhitespace: false })).toBe('  hi  ');
  });
});

describe('sanitizeEnv', () => {
  it('sanitizes all values', () => {
    const env = { KEY: '  value  ', OTHER: 'clean' };
    const result = sanitizeEnv(env);
    expect(result.sanitized.KEY).toBe('value');
    expect(result.sanitized.OTHER).toBe('clean');
  });

  it('records changes for modified keys', () => {
    const env = { KEY: '  value  ' };
    const result = sanitizeEnv(env);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].key).toBe('KEY');
  });

  it('removes empty keys when removeEmpty is true', () => {
    const env = { EMPTY: '   ', KEEP: 'value' };
    const result = sanitizeEnv(env, { removeEmpty: true });
    expect(result.removedKeys).toContain('EMPTY');
    expect(result.sanitized).not.toHaveProperty('EMPTY');
    expect(result.sanitized.KEEP).toBe('value');
  });

  it('does not remove empty keys by default', () => {
    const env = { EMPTY: '' };
    const result = sanitizeEnv(env);
    expect(result.sanitized).toHaveProperty('EMPTY');
  });

  it('returns original env unchanged', () => {
    const env = { KEY: '  val  ' };
    sanitizeEnv(env);
    expect(env.KEY).toBe('  val  ');
  });
});

describe('formatSanitizeResult', () => {
  it('returns no-change message when nothing changed', () => {
    const result = sanitizeEnv({ KEY: 'clean' });
    expect(formatSanitizeResult(result)).toContain('No sanitization');
  });

  it('lists modified keys', () => {
    const result = sanitizeEnv({ KEY: '  value  ' });
    const output = formatSanitizeResult(result);
    expect(output).toContain('KEY');
    expect(output).toContain('Modified');
  });

  it('lists removed keys', () => {
    const result = sanitizeEnv({ EMPTY: '  ' }, { removeEmpty: true });
    const output = formatSanitizeResult(result);
    expect(output).toContain('EMPTY');
    expect(output).toContain('Removed');
  });
});
