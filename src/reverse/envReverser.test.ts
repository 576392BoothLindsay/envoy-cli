import { reverseEnv, reverseValues, applyReverse, formatReverseResult } from './envReverser';

describe('reverseEnv', () => {
  it('reverses the order of all keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = reverseEnv(env);
    expect(Object.keys(result)).toEqual(['C', 'B', 'A']);
  });

  it('preserves key-value associations', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = reverseEnv(env);
    expect(result['FOO']).toBe('bar');
    expect(result['BAZ']).toBe('qux');
  });

  it('handles single-entry env', () => {
    const env = { ONLY: 'one' };
    const result = reverseEnv(env);
    expect(Object.keys(result)).toEqual(['ONLY']);
  });

  it('handles empty env', () => {
    const result = reverseEnv({});
    expect(result).toEqual({});
  });
});

describe('reverseValues', () => {
  it('reverses string values character by character', () => {
    const env = { KEY: 'hello' };
    const result = reverseValues(env);
    expect(result['KEY']).toBe('olleh');
  });

  it('reverses multiple values', () => {
    const env = { A: 'abc', B: '123' };
    const result = reverseValues(env);
    expect(result['A']).toBe('cba');
    expect(result['B']).toBe('321');
  });

  it('handles empty string values', () => {
    const env = { EMPTY: '' };
    const result = reverseValues(env);
    expect(result['EMPTY']).toBe('');
  });

  it('handles single character values', () => {
    const env = { X: 'z' };
    const result = reverseValues(env);
    expect(result['X']).toBe('z');
  });
});

describe('applyReverse', () => {
  it('reverses keys when mode is keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = applyReverse(env, 'keys');
    expect(Object.keys(result)).toEqual(['C', 'B', 'A']);
    expect(result['A']).toBe('1');
  });

  it('reverses values when mode is values', () => {
    const env = { KEY: 'hello' };
    const result = applyReverse(env, 'values');
    expect(result['KEY']).toBe('olleh');
  });

  it('reverses both keys and values when mode is both', () => {
    const env = { A: 'hello', B: 'world' };
    const result = applyReverse(env, 'both');
    expect(Object.keys(result)).toEqual(['B', 'A']);
    expect(result['A']).toBe('olleh');
    expect(result['B']).toBe('dlrow');
  });
});

describe('formatReverseResult', () => {
  it('formats result with key count', () => {
    const original = { A: '1', B: '2' };
    const reversed = { B: '2', A: '1' };
    const output = formatReverseResult(original, reversed, 'keys');
    expect(output).toContain('2');
    expect(output).toContain('keys');
  });

  it('includes mode in output', () => {
    const env = { X: 'abc' };
    const reversed = { X: 'cba' };
    const output = formatReverseResult(env, reversed, 'values');
    expect(output).toContain('values');
  });

  it('handles empty result', () => {
    const output = formatReverseResult({}, {}, 'both');
    expect(output).toBeDefined();
    expect(typeof output).toBe('string');
  });
});
