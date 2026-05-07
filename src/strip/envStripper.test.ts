import { stripBlankValues, stripKeys, stripByPattern, formatStripResult } from './envStripper';

describe('stripBlankValues', () => {
  it('removes keys with empty string values', () => {
    const env = { A: 'hello', B: '', C: 'world' };
    const result = stripBlankValues(env);
    expect(result.stripped).toEqual({ A: 'hello', C: 'world' });
    expect(result.removedKeys).toEqual(['B']);
  });

  it('removes keys with whitespace-only values', () => {
    const env = { A: '  ', B: 'value' };
    const result = stripBlankValues(env);
    expect(result.stripped).toEqual({ B: 'value' });
    expect(result.removedKeys).toContain('A');
  });

  it('removes keys with null or undefined string values', () => {
    const env = { A: 'null', B: 'undefined', C: 'real' };
    const result = stripBlankValues(env);
    expect(result.stripped).toEqual({ C: 'real' });
    expect(result.removedKeys).toEqual(['A', 'B']);
  });

  it('returns original unchanged', () => {
    const env = { A: 'x' };
    const result = stripBlankValues(env);
    expect(result.original).toEqual({ A: 'x' });
  });

  it('handles empty env', () => {
    const result = stripBlankValues({});
    expect(result.stripped).toEqual({});
    expect(result.removedKeys).toEqual([]);
  });
});

describe('stripKeys', () => {
  it('removes specified keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = stripKeys(env, ['A', 'C']);
    expect(result.stripped).toEqual({ B: '2' });
    expect(result.removedKeys).toEqual(['A', 'C']);
  });

  it('ignores keys not present in env', () => {
    const env = { A: '1' };
    const result = stripKeys(env, ['Z']);
    expect(result.stripped).toEqual({ A: '1' });
    expect(result.removedKeys).toEqual([]);
  });
});

describe('stripByPattern', () => {
  it('removes keys matching pattern', () => {
    const env = { SECRET_KEY: 'abc', PUBLIC_URL: 'http://x', SECRET_TOKEN: 'xyz' };
    const result = stripByPattern(env, /^SECRET_/);
    expect(result.stripped).toEqual({ PUBLIC_URL: 'http://x' });
    expect(result.removedKeys).toEqual(['SECRET_KEY', 'SECRET_TOKEN']);
  });

  it('keeps all keys when pattern matches nothing', () => {
    const env = { A: '1', B: '2' };
    const result = stripByPattern(env, /^NOOP/);
    expect(result.stripped).toEqual({ A: '1', B: '2' });
    expect(result.removedKeys).toEqual([]);
  });
});

describe('formatStripResult', () => {
  it('includes removed key count in output', () => {
    const env = { A: '1', B: '' };
    const result = stripBlankValues(env);
    const output = formatStripResult(result);
    expect(output).toContain('Stripped 1 key(s).');
    expect(output).toContain('- B');
  });

  it('shows zero removed keys message', () => {
    const env = { A: 'val' };
    const result = stripBlankValues(env);
    const output = formatStripResult(result);
    expect(output).toContain('Stripped 0 key(s).');
  });
});
