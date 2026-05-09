import { applyDefaults6, getMissingDefaults6, formatDefaults6Result } from './envDefaults6';

describe('applyDefaults6', () => {
  it('applies defaults for missing keys', () => {
    const env = { A: 'alpha' };
    const defaults = { A: 'default_a', B: 'default_b' };
    const result = applyDefaults6(env, defaults);
    expect(result.env).toEqual({ A: 'alpha', B: 'default_b' });
    expect(result.applied).toEqual(['B']);
    expect(result.skipped).toEqual(['A']);
  });

  it('does not overwrite empty values by default', () => {
    const env = { A: '' };
    const defaults = { A: 'filled' };
    const result = applyDefaults6(env, defaults);
    expect(result.env.A).toBe('');
    expect(result.skipped).toContain('A');
  });

  it('overwrites empty values when overwriteEmpty is true', () => {
    const env = { A: '' };
    const defaults = { A: 'filled' };
    const result = applyDefaults6(env, defaults, true);
    expect(result.env.A).toBe('filled');
    expect(result.applied).toContain('A');
  });

  it('returns unchanged env when all defaults are already set', () => {
    const env = { X: '1', Y: '2' };
    const defaults = { X: '9', Y: '9' };
    const result = applyDefaults6(env, defaults);
    expect(result.env).toEqual({ X: '1', Y: '2' });
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(2);
  });

  it('handles empty defaults gracefully', () => {
    const env = { A: '1' };
    const result = applyDefaults6(env, {});
    expect(result.env).toEqual({ A: '1' });
    expect(result.applied).toHaveLength(0);
  });
});

describe('getMissingDefaults6', () => {
  it('returns keys present in defaults but not in env', () => {
    const env = { A: '1' };
    const defaults = { A: 'x', B: 'y', C: 'z' };
    expect(getMissingDefaults6(env, defaults)).toEqual(['B', 'C']);
  });

  it('returns empty array when all defaults are present', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'x', B: 'y' };
    expect(getMissingDefaults6(env, defaults)).toHaveLength(0);
  });
});

describe('formatDefaults6Result', () => {
  it('formats applied and skipped keys', () => {
    const result = { env: {}, applied: ['B'], skipped: ['A'] };
    const output = formatDefaults6Result(result);
    expect(output).toContain('Applied defaults for: B');
    expect(output).toContain('Skipped (already set): A');
  });

  it('shows no-op message when nothing applied', () => {
    const result = { env: {}, applied: [], skipped: [] };
    expect(formatDefaults6Result(result)).toBe('No defaults applied.');
  });
});
