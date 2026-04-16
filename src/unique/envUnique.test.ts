import { uniqueByValue, formatUniqueResult } from './envUnique';

describe('uniqueByValue', () => {
  it('returns all keys when all values are unique', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = uniqueByValue(env);
    expect(result.unique).toEqual(env);
    expect(result.duplicateKeys).toHaveLength(0);
    expect(result.duplicateValues.size).toBe(0);
  });

  it('excludes keys with shared values', () => {
    const env = { A: 'same', B: 'same', C: 'unique' };
    const result = uniqueByValue(env);
    expect(result.unique).toEqual({ C: 'unique' });
    expect(result.duplicateKeys).toContain('A');
    expect(result.duplicateKeys).toContain('B');
  });

  it('groups duplicate values correctly', () => {
    const env = { X: 'v', Y: 'v', Z: 'v' };
    const result = uniqueByValue(env);
    expect(result.duplicateValues.get('v')).toEqual(['X', 'Y', 'Z']);
    expect(Object.keys(result.unique)).toHaveLength(0);
  });

  it('handles multiple groups of duplicates', () => {
    const env = { A: '1', B: '1', C: '2', D: '2', E: '3' };
    const result = uniqueByValue(env);
    expect(result.unique).toEqual({ E: '3' });
    expect(result.duplicateValues.size).toBe(2);
  });

  it('handles empty env', () => {
    const result = uniqueByValue({});
    expect(result.unique).toEqual({});
    expect(result.duplicateKeys).toHaveLength(0);
  });
});

describe('formatUniqueResult', () => {
  it('reports all unique when no duplicates', () => {
    const result = uniqueByValue({ A: '1', B: '2' });
    expect(formatUniqueResult(result)).toContain('All values are unique.');
  });

  it('reports duplicate info', () => {
    const result = uniqueByValue({ A: 'x', B: 'x', C: 'y' });
    const output = formatUniqueResult(result);
    expect(output).toContain('A');
    expect(output).toContain('B');
    expect(output).toContain('Unique keys retained: 1');
  });

  it('truncates long values in output', () => {
    const longVal = 'a'.repeat(30);
    const result = uniqueByValue({ K1: longVal, K2: longVal });
    const output = formatUniqueResult(result);
    expect(output).toContain('...');
  });
});
