import { computeDiff2, formatDiff2Result } from './envDiff2';

describe('computeDiff2', () => {
  const left = { A: '1', B: '2', C: '3' };
  const right = { A: '1', B: '99', D: '4' };

  it('detects unchanged keys', () => {
    const result = computeDiff2(left, right);
    const unchanged = result.diffs.find((d) => d.key === 'A');
    expect(unchanged?.status).toBe('unchanged');
  });

  it('detects changed keys', () => {
    const result = computeDiff2(left, right);
    const changed = result.diffs.find((d) => d.key === 'B');
    expect(changed?.status).toBe('changed');
    expect(changed?.leftValue).toBe('2');
    expect(changed?.rightValue).toBe('99');
  });

  it('detects removed keys', () => {
    const result = computeDiff2(left, right);
    const removed = result.diffs.find((d) => d.key === 'C');
    expect(removed?.status).toBe('removed');
  });

  it('detects added keys', () => {
    const result = computeDiff2(left, right);
    const added = result.diffs.find((d) => d.key === 'D');
    expect(added?.status).toBe('added');
  });

  it('returns correct summary counts', () => {
    const result = computeDiff2(left, right);
    expect(result.added).toBe(1);
    expect(result.removed).toBe(1);
    expect(result.changed).toBe(1);
    expect(result.unchanged).toBe(1);
  });

  it('respects left mode — excludes added keys', () => {
    const result = computeDiff2(left, right, 'left');
    expect(result.diffs.find((d) => d.key === 'D')).toBeUndefined();
  });

  it('respects right mode — excludes removed keys', () => {
    const result = computeDiff2(left, right, 'right');
    expect(result.diffs.find((d) => d.key === 'C')).toBeUndefined();
  });

  it('sorts diffs by key', () => {
    const result = computeDiff2(left, right);
    const keys = result.diffs.map((d) => d.key);
    expect(keys).toEqual([...keys].sort());
  });
});

describe('formatDiff2Result', () => {
  it('formats added, removed, changed lines', () => {
    const result = computeDiff2({ B: '2', C: '3' }, { B: '99', D: '4' });
    const output = formatDiff2Result(result);
    expect(output).toContain('+ D=4');
    expect(output).toContain('- C=3');
    expect(output).toContain('~ B: 2 → 99');
  });

  it('hides unchanged by default', () => {
    const result = computeDiff2({ A: '1' }, { A: '1' });
    const output = formatDiff2Result(result);
    expect(output).not.toContain('  A=1');
  });

  it('shows unchanged when flag is set', () => {
    const result = computeDiff2({ A: '1' }, { A: '1' });
    const output = formatDiff2Result(result, true);
    expect(output).toContain('  A=1');
  });

  it('includes summary line', () => {
    const result = computeDiff2({}, {});
    const output = formatDiff2Result(result);
    expect(output).toContain('Summary:');
  });
});
