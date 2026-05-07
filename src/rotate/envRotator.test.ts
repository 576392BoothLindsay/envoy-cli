import { rotateValues, rotateEnv, formatRotateResult } from './envRotator';

const baseEnv = {
  A: 'alpha',
  B: 'beta',
  C: 'gamma',
  D: 'delta',
};

describe('rotateValues', () => {
  it('shifts values right by default (shift strategy)', () => {
    const result = rotateValues(baseEnv, ['A', 'B', 'C'], 'shift');
    expect(result.A).toBe('gamma');
    expect(result.B).toBe('alpha');
    expect(result.C).toBe('beta');
    expect(result.D).toBe('delta'); // unchanged
  });

  it('cycles values left with cycle strategy', () => {
    const result = rotateValues(baseEnv, ['A', 'B', 'C'], 'cycle');
    expect(result.A).toBe('beta');
    expect(result.B).toBe('gamma');
    expect(result.C).toBe('alpha');
  });

  it('reverses values with reverse strategy', () => {
    const result = rotateValues(baseEnv, ['A', 'B', 'C'], 'reverse');
    expect(result.A).toBe('gamma');
    expect(result.B).toBe('beta');
    expect(result.C).toBe('alpha');
  });

  it('returns original env if fewer than 2 keys exist', () => {
    const result = rotateValues(baseEnv, ['A'], 'shift');
    expect(result).toEqual(baseEnv);
  });

  it('ignores keys not present in env', () => {
    const result = rotateValues(baseEnv, ['A', 'MISSING'], 'shift');
    expect(result).toEqual(baseEnv);
  });
});

describe('rotateEnv', () => {
  it('returns rotated result with metadata', () => {
    const result = rotateEnv(baseEnv, ['A', 'B'], 'cycle');
    expect(result.rotatedKeys).toEqual(['A', 'B']);
    expect(result.skippedKeys).toEqual([]);
    expect(result.rotated.A).toBe('beta');
    expect(result.rotated.B).toBe('alpha');
  });

  it('tracks skipped keys', () => {
    const result = rotateEnv(baseEnv, ['A', 'NOPE'], 'shift');
    expect(result.skippedKeys).toContain('NOPE');
    expect(result.rotatedKeys).toContain('A');
  });

  it('preserves original env reference', () => {
    const result = rotateEnv(baseEnv, ['A', 'B'], 'shift');
    expect(result.original).toEqual(baseEnv);
  });
});

describe('formatRotateResult', () => {
  it('formats rotation output', () => {
    const result = rotateEnv(baseEnv, ['A', 'B'], 'cycle');
    const output = formatRotateResult(result);
    expect(output).toContain('Rotated 2 key(s)');
    expect(output).toContain('A:');
    expect(output).toContain('→');
  });

  it('reports no keys rotated when none match', () => {
    const result = rotateEnv(baseEnv, ['X', 'Y'], 'shift');
    const output = formatRotateResult(result);
    expect(output).toBe('No keys rotated.');
  });

  it('includes skipped keys in output', () => {
    const result = rotateEnv(baseEnv, ['A', 'B', 'MISSING'], 'shift');
    const output = formatRotateResult(result);
    expect(output).toContain('Skipped (not found): MISSING');
  });
});
