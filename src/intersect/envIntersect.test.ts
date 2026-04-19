import { intersectEnvs, formatIntersectResult } from './envIntersect';

describe('intersectEnvs', () => {
  it('returns keys common to all envs with matching values', () => {
    const a = { FOO: 'bar', SHARED: 'same', ONLY_A: 'x' };
    const b = { FOO: 'bar', SHARED: 'same', ONLY_B: 'y' };
    const result = intersectEnvs([a, b]);
    expect(result.intersection).toEqual({ FOO: 'bar', SHARED: 'same' });
    expect(result.commonKeys).toHaveLength(2);
    expect(result.totalKeys).toBe(2);
  });

  it('excludes keys with differing values when matchValues=true', () => {
    const a = { KEY: 'val1' };
    const b = { KEY: 'val2' };
    const result = intersectEnvs([a, b], true);
    expect(result.intersection).toEqual({});
  });

  it('includes keys with differing values when matchValues=false', () => {
    const a = { KEY: 'val1', EXTRA: 'x' };
    const b = { KEY: 'val2' };
    const result = intersectEnvs([a, b], false);
    expect(result.commonKeys).toContain('KEY');
    expect(result.commonKeys).not.toContain('EXTRA');
  });

  it('returns empty result for empty input', () => {
    const result = intersectEnvs([]);
    expect(result.intersection).toEqual({});
    expect(result.totalKeys).toBe(0);
  });

  it('handles single env by returning all its keys', () => {
    const a = { A: '1', B: '2' };
    const result = intersectEnvs([a]);
    expect(result.intersection).toEqual(a);
  });

  it('handles three envs correctly', () => {
    const a = { X: '1', Y: '2', Z: '3' };
    const b = { X: '1', Y: '9', Z: '3' };
    const c = { X: '1', Z: '3' };
    const result = intersectEnvs([a, b, c]);
    expect(result.commonKeys).toEqual(['X', 'Z']);
  });
});

describe('formatIntersectResult', () => {
  it('formats result with common keys', () => {
    const result = { intersection: { FOO: 'bar' }, commonKeys: ['FOO'], totalKeys: 1 };
    const output = formatIntersectResult(result);
    expect(output).toContain('FOO=bar');
    expect(output).toContain('Common keys (1)');
  });

  it('returns no common keys message when empty', () => {
    const result = { intersection: {}, commonKeys: [], totalKeys: 0 };
    expect(formatIntersectResult(result)).toBe('No common keys found.');
  });
});
