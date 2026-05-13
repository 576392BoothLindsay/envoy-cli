import {
  applyDefaults8,
  getMissingDefaults8,
  formatDefaults8Result,
} from './envDefaults8';

describe('applyDefaults8', () => {
  it('applies defaults for missing keys', () => {
    const env = { A: 'hello' };
    const defaults = { A: 'default_a', B: 'default_b' };
    const { result, applied, skipped } = applyDefaults8(env, defaults);
    expect(result.A).toBe('hello');
    expect(result.B).toBe('default_b');
    expect(applied).toEqual(['B']);
    expect(skipped).toEqual(['A']);
  });

  it('does not overwrite empty values by default', () => {
    const env = { A: '' };
    const defaults = { A: 'filled' };
    const { result, skipped } = applyDefaults8(env, defaults);
    expect(result.A).toBe('');
    expect(skipped).toContain('A');
  });

  it('overwrites empty values when overwriteEmpty is true', () => {
    const env = { A: '' };
    const defaults = { A: 'filled' };
    const { result, applied } = applyDefaults8(env, defaults, true);
    expect(result.A).toBe('filled');
    expect(applied).toContain('A');
  });

  it('returns unchanged env when defaults is empty', () => {
    const env = { X: '1' };
    const { result, applied, skipped } = applyDefaults8(env, {});
    expect(result).toEqual({ X: '1' });
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});

describe('getMissingDefaults8', () => {
  it('returns keys present in defaults but missing from env', () => {
    const env = { A: '1' };
    const defaults = { A: 'x', B: 'y', C: 'z' };
    expect(getMissingDefaults8(env, defaults)).toEqual(['B', 'C']);
  });

  it('returns empty array when all defaults are present', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'x', B: 'y' };
    expect(getMissingDefaults8(env, defaults)).toHaveLength(0);
  });
});

describe('formatDefaults8Result', () => {
  it('formats applied and skipped keys', () => {
    const res = {
      result: {},
      applied: ['B', 'C'],
      skipped: ['A'],
    };
    const output = formatDefaults8Result(res);
    expect(output).toContain('Applied defaults (2)');
    expect(output).toContain('Skipped (1)');
  });

  it('shows no-op message when nothing applied', () => {
    const res = { result: {}, applied: [], skipped: [] };
    expect(formatDefaults8Result(res)).toBe('No defaults applied.');
  });
});
