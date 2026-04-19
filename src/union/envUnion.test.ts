import { unionEnvs, formatUnionResult } from './envUnion';

describe('unionEnvs', () => {
  it('merges disjoint records', () => {
    const base = { A: '1', B: '2' };
    const override = { C: '3', D: '4' };
    const result = unionEnvs(base, override);
    expect(result.union).toEqual({ A: '1', B: '2', C: '3', D: '4' });
    expect(result.addedKeys).toEqual(['C', 'D']);
    expect(result.commonKeys).toEqual([]);
  });

  it('override wins on common keys', () => {
    const base = { A: 'base', B: 'keep' };
    const override = { A: 'new' };
    const result = unionEnvs(base, override);
    expect(result.union.A).toBe('new');
    expect(result.union.B).toBe('keep');
    expect(result.commonKeys).toContain('A');
    expect(result.addedKeys).toEqual([]);
  });

  it('returns base unchanged when override is empty', () => {
    const base = { X: 'hello' };
    const result = unionEnvs(base, {});
    expect(result.union).toEqual({ X: 'hello' });
    expect(result.addedKeys).toEqual([]);
    expect(result.commonKeys).toEqual([]);
  });

  it('handles empty base', () => {
    const override = { Z: 'world' };
    const result = unionEnvs({}, override);
    expect(result.union).toEqual({ Z: 'world' });
    expect(result.addedKeys).toContain('Z');
  });
});

describe('formatUnionResult', () => {
  it('includes total key count', () => {
    const result = unionEnvs({ A: '1' }, { B: '2' });
    const output = formatUnionResult(result);
    expect(output).toContain('2 total keys');
  });

  it('lists added keys', () => {
    const result = unionEnvs({ A: '1' }, { B: '2' });
    const output = formatUnionResult(result);
    expect(output).toContain('B');
  });

  it('lists common keys', () => {
    const result = unionEnvs({ A: '1' }, { A: '2' });
    const output = formatUnionResult(result);
    expect(output).toContain('A');
    expect(output).toContain('override wins');
  });
});
