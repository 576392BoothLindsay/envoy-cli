import { applyDefaults5, getMissingDefaults5, formatDefaults5Result } from './envDefaults5';

describe('applyDefaults5', () => {
  it('applies defaults for missing keys', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'default_foo', BAZ: 'default_baz' };
    const result = applyDefaults5(env, defaults);
    expect(result.env.FOO).toBe('bar');
    expect(result.env.BAZ).toBe('default_baz');
    expect(result.applied).toContain('BAZ');
    expect(result.skipped).toContain('FOO');
  });

  it('does not override existing non-empty values', () => {
    const env = { KEY: 'value' };
    const defaults = { KEY: 'default' };
    const result = applyDefaults5(env, defaults);
    expect(result.env.KEY).toBe('value');
    expect(result.skipped).toContain('KEY');
  });

  it('overrides empty values when overrideEmpty is true', () => {
    const env = { KEY: '' };
    const defaults = { KEY: 'fallback' };
    const result = applyDefaults5(env, defaults, true);
    expect(result.env.KEY).toBe('fallback');
    expect(result.applied).toContain('KEY');
  });

  it('does not override empty values by default', () => {
    const env = { KEY: '' };
    const defaults = { KEY: 'fallback' };
    const result = applyDefaults5(env, defaults, false);
    expect(result.env.KEY).toBe('');
    expect(result.skipped).toContain('KEY');
  });

  it('returns original env unchanged when no defaults provided', () => {
    const env = { A: '1', B: '2' };
    const result = applyDefaults5(env, {});
    expect(result.env).toEqual(env);
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('getMissingDefaults5', () => {
  it('returns keys present in defaults but not in env', () => {
    const env = { A: '1' };
    const defaults = { A: 'x', B: 'y', C: 'z' };
    expect(getMissingDefaults5(env, defaults)).toEqual(['B', 'C']);
  });

  it('returns empty array when all defaults are present', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'x', B: 'y' };
    expect(getMissingDefaults5(env, defaults)).toHaveLength(0);
  });
});

describe('formatDefaults5Result', () => {
  it('formats applied and skipped keys', () => {
    const result = { env: {}, applied: ['B'], skipped: ['A'] };
    const output = formatDefaults5Result(result);
    expect(output).toContain('Applied defaults for: B');
    expect(output).toContain('Skipped (already set): A');
  });

  it('returns fallback message when nothing changed', () => {
    const result = { env: {}, applied: [], skipped: [] };
    expect(formatDefaults5Result(result)).toBe('No defaults to apply.');
  });
});
