import { freezeKeys, applyFreeze, formatFreezeResult } from './envFreeze';

describe('freezeKeys', () => {
  it('marks existing keys as frozen', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = freezeKeys(env, ['A', 'B']);
    expect(result.frozenKeys).toEqual(['A', 'B']);
    expect(result.skipped).toEqual([]);
  });

  it('skips keys not in env', () => {
    const env = { A: '1' };
    const result = freezeKeys(env, ['A', 'MISSING']);
    expect(result.frozenKeys).toEqual(['A']);
    expect(result.skipped).toEqual(['MISSING']);
  });

  it('returns copy of env in frozen', () => {
    const env = { X: 'val' };
    const result = freezeKeys(env, ['X']);
    expect(result.frozen).toEqual({ X: 'val' });
  });
});

describe('applyFreeze', () => {
  it('preserves frozen key values from base', () => {
    const base = { A: 'original', B: 'base_b' };
    const incoming = { A: 'changed', B: 'new_b', C: 'new_c' };
    const result = applyFreeze(base, incoming, ['A']);
    expect(result.A).toBe('original');
    expect(result.B).toBe('new_b');
    expect(result.C).toBe('new_c');
  });

  it('ignores frozen keys not in base', () => {
    const base = {};
    const incoming = { A: 'val' };
    const result = applyFreeze(base, incoming, ['A']);
    expect(result.A).toBe('val');
  });
});

describe('formatFreezeResult', () => {
  it('formats frozen and skipped keys', () => {
    const result = { frozen: {}, frozenKeys: ['A'], skipped: ['B'] };
    const output = formatFreezeResult(result);
    expect(output).toContain('Frozen keys');
    expect(output).toContain('A');
    expect(output).toContain('Skipped');
    expect(output).toContain('B');
  });

  it('returns no keys message when empty', () => {
    const result = { frozen: {}, frozenKeys: [], skipped: [] };
    expect(formatFreezeResult(result)).toBe('No keys frozen.');
  });
});
