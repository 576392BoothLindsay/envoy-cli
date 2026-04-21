import { reverseEnv, reverseValues, applyReverse, formatReverseResult } from './envReverser';

describe('reverseEnv', () => {
  it('reverses the order of keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = reverseEnv(env);
    expect(Object.keys(result)).toEqual(['C', 'B', 'A']);
  });

  it('preserves values when reversing key order', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = reverseEnv(env);
    expect(result['FOO']).toBe('bar');
    expect(result['BAZ']).toBe('qux');
  });

  it('handles empty env', () => {
    expect(reverseEnv({})).toEqual({});
  });
});

describe('reverseValues', () => {
  it('reverses characters in each value', () => {
    const env = { KEY: 'hello', OTHER: 'world' };
    const result = reverseValues(env);
    expect(result['KEY']).toBe('olleh');
    expect(result['OTHER']).toBe('dlrow');
  });

  it('handles empty values', () => {
    const env = { EMPTY: '' };
    expect(reverseValues(env)['EMPTY']).toBe('');
  });

  it('handles single character values', () => {
    const env = { X: 'a' };
    expect(reverseValues(env)['X']).toBe('a');
  });
});

describe('applyReverse', () => {
  it('reverses key order by default', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = applyReverse(env);
    expect(Object.keys(result.reversed)).toEqual(['C', 'B', 'A']);
    expect(result.count).toBe(3);
  });

  it('reverses values when option is set', () => {
    const env = { KEY: 'hello' };
    const result = applyReverse(env, { reverseValues: true });
    expect(result.reversed['KEY']).toBe('olleh');
  });

  it('preserves original env in result', () => {
    const env = { A: '1', B: '2' };
    const result = applyReverse(env);
    expect(result.original).toEqual(env);
  });
});

describe('formatReverseResult', () => {
  it('formats result with count and entries', () => {
    const env = { A: '1', B: '2' };
    const result = applyReverse(env);
    const formatted = formatReverseResult(result);
    expect(formatted).toContain('Reversed 2 key(s).');
    expect(formatted).toContain('B=2');
    expect(formatted).toContain('A=1');
  });

  it('formats empty result', () => {
    const result = applyReverse({});
    const formatted = formatReverseResult(result);
    expect(formatted).toContain('Reversed 0 key(s).');
  });
});
