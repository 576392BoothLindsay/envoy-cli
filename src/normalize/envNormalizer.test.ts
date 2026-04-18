import { normalizeEnv, formatNormalizeResult } from './envNormalizer';

describe('normalizeEnv', () => {
  it('trims key whitespace by default', () => {
    const result = normalizeEnv({ '  KEY  ': 'value' });
    expect(result.normalized['KEY']).toBe('value');
    expect(result.changes[0].change).toContain('trimmed key');
  });

  it('trims value whitespace by default', () => {
    const result = normalizeEnv({ KEY: '  value  ' });
    expect(result.normalized['KEY']).toBe('value');
    expect(result.changes[0].change).toContain('trimmed value');
  });

  it('uppercases keys when option is set', () => {
    const result = normalizeEnv({ myKey: 'val' }, { uppercaseKeys: true });
    expect(result.normalized['MYKEY']).toBe('val');
    expect(result.changes[0].change).toContain('uppercased');
  });

  it('removes empty values when removeEmpty is true', () => {
    const result = normalizeEnv({ KEY: '' }, { removeEmpty: true });
    expect(result.normalized['KEY']).toBeUndefined();
    expect(result.changes[0].change).toContain('removed empty');
  });

  it('keeps empty values when removeEmpty is false', () => {
    const result = normalizeEnv({ KEY: '' }, { removeEmpty: false });
    expect(result.normalized['KEY']).toBe('');
  });

  it('removes inline comments by default', () => {
    const result = normalizeEnv({ KEY: 'value # this is a comment' });
    expect(result.normalized['KEY']).toBe('value');
    expect(result.changes[0].change).toContain('removed inline comment');
  });

  it('preserves inline comments when removeComments is false', () => {
    const result = normalizeEnv({ KEY: 'value # comment' }, { removeComments: false });
    expect(result.normalized['KEY']).toBe('value # comment');
  });

  it('returns original env unchanged', () => {
    const env = { KEY: '  val  ' };
    const result = normalizeEnv(env);
    expect(result.original).toBe(env);
  });

  it('reports no changes for clean input', () => {
    const result = normalizeEnv({ KEY: 'value' });
    expect(result.changes).toHaveLength(0);
  });
});

describe('formatNormalizeResult', () => {
  it('returns no-change message when empty', () => {
    const result = normalizeEnv({ KEY: 'value' });
    expect(formatNormalizeResult(result)).toContain('No changes');
  });

  it('lists changes when present', () => {
    const result = normalizeEnv({ KEY: '  val  ' });
    const output = formatNormalizeResult(result);
    expect(output).toContain('1 change');
    expect(output).toContain('KEY');
  });
});
