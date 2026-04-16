import { trimEnv, trimKey, trimValue, formatTrimResult } from './envTrimmer';

describe('trimKey', () => {
  it('trims leading and trailing whitespace from key', () => {
    expect(trimKey('  KEY  ')).toBe('KEY');
    expect(trimKey('KEY')).toBe('KEY');
    expect(trimKey('  KEY')).toBe('KEY');
  });
});

describe('trimValue', () => {
  it('trims leading and trailing whitespace from value', () => {
    expect(trimValue('  hello  ')).toBe('hello');
    expect(trimValue('hello')).toBe('hello');
    expect(trimValue('')).toBe('');
  });
});

describe('trimEnv', () => {
  const env = {
    '  KEY_A  ': '  value_a  ',
    KEY_B: 'value_b',
    KEY_C: '  value_c',
  };

  it('trims both keys and values by default', () => {
    const { trimmed, modifiedKeys } = trimEnv(env);
    expect(trimmed['KEY_A']).toBe('value_a');
    expect(trimmed['KEY_B']).toBe('value_b');
    expect(trimmed['KEY_C']).toBe('value_c');
    expect(modifiedKeys).toContain('  KEY_A  ');
    expect(modifiedKeys).toContain('KEY_C');
    expect(modifiedKeys).not.toContain('KEY_B');
  });

  it('trims only values when target is values', () => {
    const { trimmed } = trimEnv(env, { target: 'values' });
    expect(Object.keys(trimmed)).toContain('  KEY_A  ');
    expect(trimmed['  KEY_A  ']).toBe('value_a');
  });

  it('trims only keys when target is keys', () => {
    const { trimmed } = trimEnv(env, { target: 'keys' });
    expect(trimmed['KEY_A']).toBe('  value_a  ');
    expect(trimmed['KEY_C']).toBe('  value_c');
  });

  it('removes empty values when removeEmptyLines is true', () => {
    const envWithEmpty = { KEY_A: 'value', KEY_B: '   ' };
    const { trimmed } = trimEnv(envWithEmpty, { removeEmptyLines: true });
    expect(trimmed['KEY_A']).toBe('value');
    expect(trimmed['KEY_B']).toBeUndefined();
  });

  it('returns original env unchanged in result', () => {
    const { original } = trimEnv(env);
    expect(original).toEqual(env);
  });
});

describe('formatTrimResult', () => {
  it('returns no-op message when nothing was trimmed', () => {
    const result = trimEnv({ KEY: 'value' });
    expect(formatTrimResult(result)).toBe('No keys or values required trimming.');
  });

  it('lists modified keys', () => {
    const result = trimEnv({ '  KEY  ': '  val  ' });
    const output = formatTrimResult(result);
    expect(output).toContain('Trimmed 1 entry');
    expect(output).toContain('val');
  });
});
