import { describe, it, expect } from 'vitest';
import {
  findDuplicateKeys,
  removeDuplicateKeys,
  duplicateEnv,
  formatDuplicateResult,
} from './envDuplicate';

describe('findDuplicateKeys', () => {
  it('returns empty array when no duplicates', () => {
    const result = findDuplicateKeys([{ A: '1' }, { B: '2' }]);
    expect(result).toEqual([]);
  });

  it('detects duplicate keys across envs', () => {
    const result = findDuplicateKeys([{ A: '1', B: '2' }, { A: '3' }]);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('A');
    expect(result[0].count).toBe(2);
  });

  it('counts multiple occurrences correctly', () => {
    const result = findDuplicateKeys([{ X: '1' }, { X: '2' }, { X: '3' }]);
    expect(result[0].count).toBe(3);
  });
});

describe('removeDuplicateKeys', () => {
  it('keeps first occurrence of each key', () => {
    const result = removeDuplicateKeys([{ A: '1', B: '2' }, { A: 'override' }]);
    expect(result).toEqual({ A: '1', B: '2' });
  });

  it('merges non-overlapping keys', () => {
    const result = removeDuplicateKeys([{ A: '1' }, { B: '2' }]);
    expect(result).toEqual({ A: '1', B: '2' });
  });
});

describe('duplicateEnv', () => {
  it('returns full result with duplicates and cleaned env', () => {
    const result = duplicateEnv([{ A: '1', B: '2' }, { A: 'x' }]);
    expect(result.duplicates).toHaveLength(1);
    expect(result.cleaned).toEqual({ A: '1', B: '2' });
    expect(result.removedCount).toBe(1);
  });

  it('handles no duplicates gracefully', () => {
    const result = duplicateEnv([{ A: '1' }, { B: '2' }]);
    expect(result.duplicates).toHaveLength(0);
    expect(result.removedCount).toBe(0);
  });
});

describe('formatDuplicateResult', () => {
  it('returns no duplicates message when clean', () => {
    const result = duplicateEnv([{ A: '1' }]);
    expect(formatDuplicateResult(result)).toBe('No duplicate keys found.');
  });

  it('formats duplicate summary', () => {
    const result = duplicateEnv([{ A: '1' }, { A: '2' }, { B: '3' }]);
    const formatted = formatDuplicateResult(result);
    expect(formatted).toContain('A');
    expect(formatted).toContain('2 times');
  });
});
