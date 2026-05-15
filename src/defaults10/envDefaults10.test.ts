import {
  applyDefaults10,
  getMissingDefaults10,
  formatDefaults10Result,
} from './envDefaults10';

describe('applyDefaults10', () => {
  it('applies defaults for missing keys', () => {
    const env = { A: 'hello' };
    const defaults = { A: 'default_a', B: 'default_b' };
    const { result, applied, skipped } = applyDefaults10(env, defaults);
    expect(result.A).toBe('hello');
    expect(result.B).toBe('default_b');
    expect(applied).toEqual(['B']);
    expect(skipped).toEqual(['A']);
  });

  it('does not overwrite existing non-empty values', () => {
    const env = { A: 'existing' };
    const defaults = { A: 'default_a' };
    const { result } = applyDefaults10(env, defaults);
    expect(result.A).toBe('existing');
  });

  it('does not overwrite empty values by default', () => {
    const env = { A: '' };
    const defaults = { A: 'default_a' };
    const { result, skipped } = applyDefaults10(env, defaults);
    expect(result.A).toBe('');
    expect(skipped).toContain('A');
  });

  it('overwrites empty values when overwriteEmpty is true', () => {
    const env = { A: '' };
    const defaults = { A: 'default_a' };
    const { result, applied } = applyDefaults10(env, defaults, true);
    expect(result.A).toBe('default_a');
    expect(applied).toContain('A');
  });

  it('returns empty applied/skipped when defaults is empty', () => {
    const { applied, skipped } = applyDefaults10({ A: '1' }, {});
    expect(applied).toHaveLength(0);
    expect(skipped).toHaveLength(0);
  });
});

describe('getMissingDefaults10', () => {
  it('returns keys missing from env', () => {
    const missing = getMissingDefaults10({ A: 'val' }, { A: 'd', B: 'd' });
    expect(missing).toEqual(['B']);
  });

  it('includes empty-value keys', () => {
    const missing = getMissingDefaults10({ A: '' }, { A: 'd' });
    expect(missing).toContain('A');
  });
});

describe('formatDefaults10Result', () => {
  it('formats applied and skipped keys', () => {
    const output = formatDefaults10Result({
      result: {},
      applied: ['B'],
      skipped: ['A'],
    });
    expect(output).toContain('Applied defaults for: B');
    expect(output).toContain('Skipped (already set): A');
  });

  it('shows fallback message when nothing applied', () => {
    const output = formatDefaults10Result({ result: {}, applied: [], skipped: [] });
    expect(output).toBe('No defaults applied.');
  });
});
