import { invertEnv, formatInvertResult } from './envInverter';

describe('invertEnv', () => {
  it('inverts keys and values', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    const result = invertEnv(env);
    expect(result.inverted).toEqual({ bar: 'FOO', qux: 'BAZ' });
    expect(result.count).toBe(2);
    expect(result.skipped).toHaveLength(0);
  });

  it('skips keys with empty values', () => {
    const env = { FOO: '', BAR: 'hello' };
    const result = invertEnv(env);
    expect(result.inverted).toEqual({ hello: 'BAR' });
    expect(result.skipped).toContain('FOO');
  });

  it('skips duplicate values keeping first', () => {
    const env = { A: 'same', B: 'same' };
    const result = invertEnv(env);
    expect(result.inverted).toEqual({ same: 'A' });
    expect(result.skipped).toContain('B');
  });

  it('returns empty for empty input', () => {
    const result = invertEnv({});
    expect(result.inverted).toEqual({});
    expect(result.count).toBe(0);
  });
});

describe('formatInvertResult', () => {
  it('formats result without skipped', () => {
    const result = { inverted: { a: 'A' }, skipped: [], count: 1 };
    expect(formatInvertResult(result)).toContain('Inverted 1 key(s)');
  });

  it('includes skipped keys in output', () => {
    const result = { inverted: {}, skipped: ['X', 'Y'], count: 0 };
    const output = formatInvertResult(result);
    expect(output).toContain('X');
    expect(output).toContain('Y');
  });
});
