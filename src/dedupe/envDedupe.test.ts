import {
  findDuplicateValues,
  dedupeEnv,
  formatDedupeResult,
} from './envDedupe';

describe('findDuplicateValues', () => {
  it('returns empty array when no duplicates exist', () => {
    const env = { A: '1', B: '2', C: '3' };
    expect(findDuplicateValues(env)).toEqual([]);
  });

  it('detects keys sharing the same value', () => {
    const env = { A: 'hello', B: 'hello', C: 'world' };
    const result = findDuplicateValues(env);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe('hello');
    expect(result[0].keys).toContain('A');
    expect(result[0].keys).toContain('B');
  });

  it('detects multiple duplicate groups', () => {
    const env = { A: 'x', B: 'x', C: 'y', D: 'y' };
    const result = findDuplicateValues(env);
    expect(result).toHaveLength(2);
  });

  it('handles empty env', () => {
    expect(findDuplicateValues({})).toEqual([]);
  });
});

describe('dedupeEnv', () => {
  it('returns original unchanged when no duplicates', () => {
    const env = { A: '1', B: '2' };
    const result = dedupeEnv(env);
    expect(result.deduped).toEqual(env);
    expect(result.removedKeys).toEqual([]);
    expect(result.duplicates).toHaveLength(0);
  });

  it('keeps first alphabetical key and removes the rest', () => {
    const env = { B: 'shared', A: 'shared', C: 'unique' };
    const result = dedupeEnv(env);
    expect(result.deduped).toHaveProperty('A', 'shared');
    expect(result.deduped).not.toHaveProperty('B');
    expect(result.deduped).toHaveProperty('C', 'unique');
    expect(result.removedKeys).toContain('B');
  });

  it('handles multiple duplicate groups', () => {
    const env = { A: 'x', B: 'x', C: 'y', D: 'y' };
    const result = dedupeEnv(env);
    expect(Object.keys(result.deduped)).toHaveLength(2);
    expect(result.removedKeys).toHaveLength(2);
  });

  it('preserves original record reference', () => {
    const env = { A: '1', B: '1' };
    const result = dedupeEnv(env);
    expect(result.original).toBe(env);
  });
});

describe('formatDedupeResult', () => {
  it('returns no-duplicates message when clean', () => {
    const env = { A: '1', B: '2' };
    const result = dedupeEnv(env);
    expect(formatDedupeResult(result)).toBe('No duplicate values found.');
  });

  it('includes duplicate info in output', () => {
    const env = { A: 'hello', B: 'hello' };
    const result = dedupeEnv(env);
    const output = formatDedupeResult(result);
    expect(output).toContain('hello');
    expect(output).toContain('A');
    expect(output).toContain('B');
  });

  it('truncates long values in output', () => {
    const longVal = 'a'.repeat(60);
    const env = { X: longVal, Y: longVal };
    const result = dedupeEnv(env);
    const output = formatDedupeResult(result);
    expect(output).toContain('...');
  });

  it('lists removed keys', () => {
    const env = { A: 'dup', B: 'dup' };
    const result = dedupeEnv(env);
    const output = formatDedupeResult(result);
    expect(output).toContain('Removed keys:');
  });
});
