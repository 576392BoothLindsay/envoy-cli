import { applyDefaults, getMissingDefaults, formatDefaultsResult } from './envDefaults';

describe('applyDefaults', () => {
  it('applies defaults for missing keys', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'default_foo', BAZ: 'default_baz' };
    const result = applyDefaults(env, defaults);
    expect(result.result.FOO).toBe('bar');
    expect(result.result.BAZ).toBe('default_baz');
    expect(result.applied).toEqual({ BAZ: 'default_baz' });
    expect(result.skipped).toEqual({ FOO: 'bar' });
  });

  it('does not overwrite existing keys by default', () => {
    const env = { FOO: 'existing' };
    const defaults = { FOO: 'default' };
    const result = applyDefaults(env, defaults);
    expect(result.result.FOO).toBe('existing');
    expect(Object.keys(result.applied)).toHaveLength(0);
  });

  it('overwrites existing keys when overwrite=true', () => {
    const env = { FOO: 'existing' };
    const defaults = { FOO: 'default' };
    const result = applyDefaults(env, defaults, true);
    expect(result.result.FOO).toBe('default');
    expect(result.applied).toEqual({ FOO: 'default' });
    expect(result.skipped).toEqual({ FOO: 'existing' });
  });

  it('applies all defaults when env is empty', () => {
    const env = {};
    const defaults = { A: '1', B: '2' };
    const result = applyDefaults(env, defaults);
    expect(result.result).toEqual({ A: '1', B: '2' });
    expect(Object.keys(result.applied)).toHaveLength(2);
  });
});

describe('getMissingDefaults', () => {
  it('returns only missing keys', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'x', BAR: 'y', BAZ: 'z' };
    const missing = getMissingDefaults(env, defaults);
    expect(missing).toEqual({ BAR: 'y', BAZ: 'z' });
  });

  it('returns empty object when all defaults are present', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'x', B: 'y' };
    expect(getMissingDefaults(env, defaults)).toEqual({});
  });
});

describe('formatDefaultsResult', () => {
  it('formats applied and skipped keys', () => {
    const result = {
      applied: { BAZ: 'default_baz' },
      skipped: { FOO: 'bar' },
      result: { FOO: 'bar', BAZ: 'default_baz' },
    };
    const output = formatDefaultsResult(result);
    expect(output).toContain('Applied 1 default(s)');
    expect(output).toContain('+ BAZ=default_baz');
    expect(output).toContain('Skipped 1 existing key(s)');
    expect(output).toContain('~ FOO=bar');
  });

  it('shows no defaults applied message when nothing was applied', () => {
    const result = { applied: {}, skipped: { A: '1' }, result: { A: '1' } };
    const output = formatDefaultsResult(result);
    expect(output).toContain('No defaults applied.');
  });
});
