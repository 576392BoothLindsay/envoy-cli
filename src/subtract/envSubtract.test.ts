import { subtractEnv, formatSubtractResult } from './envSubtract';

describe('subtractEnv', () => {
  it('removes keys present in subtrahend', () => {
    const minuend = { A: '1', B: '2', C: '3' };
    const subtrahend = { B: 'x', C: 'y' };
    const { result, removedKeys, remainingCount } = subtractEnv(minuend, subtrahend);
    expect(result).toEqual({ A: '1' });
    expect(removedKeys).toEqual(expect.arrayContaining(['B', 'C']));
    expect(remainingCount).toBe(1);
  });

  it('returns all keys when subtrahend is empty', () => {
    const minuend = { A: '1', B: '2' };
    const { result, removedKeys, remainingCount } = subtractEnv(minuend, {});
    expect(result).toEqual({ A: '1', B: '2' });
    expect(removedKeys).toHaveLength(0);
    expect(remainingCount).toBe(2);
  });

  it('returns empty when all keys are subtracted', () => {
    const minuend = { A: '1', B: '2' };
    const subtrahend = { A: 'x', B: 'y' };
    const { result, removedKeys, remainingCount } = subtractEnv(minuend, subtrahend);
    expect(result).toEqual({});
    expect(removedKeys).toHaveLength(2);
    expect(remainingCount).toBe(0);
  });

  it('ignores keys in subtrahend not present in minuend', () => {
    const minuend = { A: '1' };
    const subtrahend = { B: '2', C: '3' };
    const { result, removedKeys } = subtractEnv(minuend, subtrahend);
    expect(result).toEqual({ A: '1' });
    expect(removedKeys).toHaveLength(0);
  });
});

describe('formatSubtractResult', () => {
  it('shows removed keys and remaining count', () => {
    const output = formatSubtractResult({
      result: { A: '1' },
      removedKeys: ['B', 'C'],
      remainingCount: 1,
    });
    expect(output).toContain('Removed 2 key(s)');
    expect(output).toContain('- B');
    expect(output).toContain('- C');
    expect(output).toContain('Remaining keys: 1');
  });

  it('shows no keys removed message', () => {
    const output = formatSubtractResult({
      result: { A: '1' },
      removedKeys: [],
      remainingCount: 1,
    });
    expect(output).toContain('No keys were removed.');
  });
});
