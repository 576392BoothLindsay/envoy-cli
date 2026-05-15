import {
  applyDefaults12,
  getMissingDefaults12,
  formatDefaults12Result,
} from './envDefaults12';

describe('applyDefaults12', () => {
  it('applies defaults for missing keys', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'default_foo', BAZ: 'default_baz' };
    const result = applyDefaults12(env, defaults);
    expect(result.env.FOO).toBe('bar');
    expect(result.env.BAZ).toBe('default_baz');
    expect(result.applied).toContain('BAZ');
    expect(result.skipped).toContain('FOO');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'overwritten' };
    const result = applyDefaults12(env, defaults, true);
    expect(result.env.FOO).toBe('overwritten');
    expect(result.applied).toContain('FOO');
    expect(result.skipped).toHaveLength(0);
  });

  it('returns empty applied and skipped when defaults is empty', () => {
    const env = { FOO: 'bar' };
    const result = applyDefaults12(env, {});
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
    expect(result.env).toEqual({ FOO: 'bar' });
  });

  it('does not mutate original env', () => {
    const env = { FOO: 'bar' };
    applyDefaults12(env, { NEW: 'val' });
    expect(env).not.toHaveProperty('NEW');
  });
});

describe('getMissingDefaults12', () => {
  it('returns keys present in defaults but missing from env', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'x', BAR: 'y', BAZ: 'z' };
    expect(getMissingDefaults12(env, defaults)).toEqual(['BAR', 'BAZ']);
  });

  it('returns empty array when all defaults are present', () => {
    const env = { FOO: 'bar', BAR: 'baz' };
    const defaults = { FOO: 'x', BAR: 'y' };
    expect(getMissingDefaults12(env, defaults)).toHaveLength(0);
  });
});

describe('formatDefaults12Result', () => {
  it('formats result with applied and skipped', () => {
    const result = {
      env: {},
      applied: ['BAR', 'BAZ'],
      skipped: ['FOO'],
    };
    const output = formatDefaults12Result(result);
    expect(output).toContain('Applied defaults');
    expect(output).toContain('BAR');
    expect(output).toContain('Skipped');
    expect(output).toContain('FOO');
  });

  it('returns fallback message when nothing to apply', () => {
    const result = { env: {}, applied: [], skipped: [] };
    expect(formatDefaults12Result(result)).toBe('No defaults to apply.');
  });
});
