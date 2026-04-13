import { mergeEnvRecords, mergeMultipleEnvs, MergeResult } from './envMerge';

describe('mergeEnvRecords', () => {
  const base = { FOO: 'foo', SHARED: 'base-value', ONLY_BASE: 'only' };
  const theirs = { BAR: 'bar', SHARED: 'their-value', ONLY_THEIRS: 'theirs' };

  it('adds keys present only in theirs', () => {
    const result = mergeEnvRecords(base, theirs);
    expect(result.merged.BAR).toBe('bar');
    expect(result.merged.ONLY_THEIRS).toBe('theirs');
    expect(result.addedKeys).toContain('BAR');
    expect(result.addedKeys).toContain('ONLY_THEIRS');
  });

  it('keeps keys present only in base', () => {
    const result = mergeEnvRecords(base, theirs);
    expect(result.merged.ONLY_BASE).toBe('only');
    expect(result.removedKeys).toContain('ONLY_BASE');
  });

  it('detects conflicts for differing shared keys', () => {
    const result = mergeEnvRecords(base, theirs);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0].key).toBe('SHARED');
    expect(result.conflicts[0].baseValue).toBe('base-value');
    expect(result.conflicts[0].theirsValue).toBe('their-value');
  });

  it('uses ours value by default on conflict', () => {
    const result = mergeEnvRecords(base, theirs, 'ours');
    expect(result.merged.SHARED).toBe('base-value');
    expect(result.overriddenKeys).not.toContain('SHARED');
  });

  it('uses theirs value when strategy is theirs', () => {
    const result = mergeEnvRecords(base, theirs, 'theirs');
    expect(result.merged.SHARED).toBe('their-value');
    expect(result.overriddenKeys).toContain('SHARED');
  });

  it('throws on conflict when strategy is error', () => {
    expect(() => mergeEnvRecords(base, theirs, 'error')).toThrow(
      /Merge conflict on key "SHARED"/
    );
  });

  it('returns empty conflicts when no differences exist', () => {
    const same = { FOO: 'foo' };
    const result = mergeEnvRecords(same, { ...same });
    expect(result.conflicts).toHaveLength(0);
    expect(result.merged).toEqual(same);
  });
});

describe('mergeMultipleEnvs', () => {
  it('returns empty result for empty input', () => {
    const result = mergeMultipleEnvs([]);
    expect(result.merged).toEqual({});
    expect(result.conflicts).toHaveLength(0);
  });

  it('returns copy of single env', () => {
    const env = { A: '1', B: '2' };
    const result = mergeMultipleEnvs([env]);
    expect(result.merged).toEqual(env);
  });

  it('merges three envs accumulating results', () => {
    const a = { FOO: 'a', SHARED: 'a' };
    const b = { BAR: 'b', SHARED: 'b' };
    const c = { BAZ: 'c' };
    const result = mergeMultipleEnvs([a, b, c], 'theirs');
    expect(result.merged.FOO).toBe('a');
    expect(result.merged.BAR).toBe('b');
    expect(result.merged.BAZ).toBe('c');
    expect(result.merged.SHARED).toBe('b');
    expect(result.conflicts.length).toBeGreaterThan(0);
  });

  it('accumulates added keys across merges', () => {
    const a = { A: '1' };
    const b = { B: '2' };
    const c = { C: '3' };
    const result = mergeMultipleEnvs([a, b, c]);
    expect(result.addedKeys).toContain('B');
    expect(result.addedKeys).toContain('C');
  });
});
