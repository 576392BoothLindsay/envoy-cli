import { findDuplicateValues, dedupeEnv, formatDedupeResult } from './envDedupe';

describe('findDuplicateValues', () => {
  it('should find keys with duplicate values', () => {
    const env = { A: 'hello', B: 'hello', C: 'world', D: 'world', E: 'unique' };
    const dupes = findDuplicateValues(env);
    expect(dupes.get('hello')).toEqual(expect.arrayContaining(['A', 'B']));
    expect(dupes.get('world')).toEqual(expect.arrayContaining(['C', 'D']));
    expect(dupes.has('unique')).toBe(false);
  });

  it('should return empty map when no duplicates', () => {
    const env = { A: '1', B: '2', C: '3' };
    expect(findDuplicateValues(env).size).toBe(0);
  });

  it('should handle empty env', () => {
    expect(findDuplicateValues({}).size).toBe(0);
  });

  it('should handle empty string values as duplicates', () => {
    const env = { A: '', B: '', C: 'val' };
    const dupes = findDuplicateValues(env);
    expect(dupes.get('')).toEqual(expect.arrayContaining(['A', 'B']));
  });
});

describe('dedupeEnv', () => {
  it('should keep first occurrence by default (keep-first)', () => {
    const env = { A: 'dup', B: 'dup', C: 'unique' };
    const result = dedupeEnv(env, 'keep-first');
    expect(result.env).toEqual({ A: 'dup', C: 'unique' });
    expect(result.removed).toEqual(['B']);
  });

  it('should keep last occurrence with keep-last strategy', () => {
    const env = { A: 'dup', B: 'dup', C: 'unique' };
    const result = dedupeEnv(env, 'keep-last');
    expect(result.env).toEqual({ B: 'dup', C: 'unique' });
    expect(result.removed).toEqual(['A']);
  });

  it('should remove all duplicates with remove-all strategy', () => {
    const env = { A: 'dup', B: 'dup', C: 'unique' };
    const result = dedupeEnv(env, 'remove-all');
    expect(result.env).toEqual({ C: 'unique' });
    expect(result.removed).toEqual(expect.arrayContaining(['A', 'B']));
  });

  it('should return unchanged env when no duplicates', () => {
    const env = { A: '1', B: '2' };
    const result = dedupeEnv(env, 'keep-first');
    expect(result.env).toEqual(env);
    expect(result.removed).toEqual([]);
  });

  it('should handle multiple duplicate groups', () => {
    const env = { A: 'x', B: 'x', C: 'y', D: 'y', E: 'z' };
    const result = dedupeEnv(env, 'keep-first');
    expect(result.removed.length).toBe(2);
    expect(result.env).toHaveProperty('A');
    expect(result.env).toHaveProperty('C');
    expect(result.env).toHaveProperty('E');
  });
});

describe('formatDedupeResult', () => {
  it('should format result with removals', () => {
    const output = formatDedupeResult({ env: { A: 'val' }, removed: ['B', 'C'] });
    expect(output).toContain('Removed 2 duplicate');
    expect(output).toContain('B');
    expect(output).toContain('C');
  });

  it('should format result with no duplicates found', () => {
    const output = formatDedupeResult({ env: { A: 'val' }, removed: [] });
    expect(output).toContain('No duplicate');
  });
});
