import { applyDefaults2, getMissingDefaults2, formatDefaults2Result } from './envDefaults2';

describe('applyDefaults2', () => {
  it('fills in missing keys', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'default_foo', BAZ: 'default_baz' };
    const result = applyDefaults2(env, defaults);
    expect(result.result).toEqual({ FOO: 'bar', BAZ: 'default_baz' });
    expect(result.applied).toEqual(['BAZ']);
    expect(result.skipped).toEqual(['FOO']);
  });

  it('fills in empty keys', () => {
    const env = { FOO: '' };
    const defaults = { FOO: 'filled' };
    const result = applyDefaults2(env, defaults);
    expect(result.result.FOO).toBe('filled');
    expect(result.applied).toContain('FOO');
  });

  it('overwrites when option is set', () => {
    const env = { FOO: 'existing' };
    const defaults = { FOO: 'new_value' };
    const result = applyDefaults2(env, defaults, { overwrite: true });
    expect(result.result.FOO).toBe('new_value');
    expect(result.applied).toContain('FOO');
  });

  it('does not overwrite by default', () => {
    const env = { FOO: 'existing' };
    const defaults = { FOO: 'new_value' };
    const result = applyDefaults2(env, defaults);
    expect(result.result.FOO).toBe('existing');
    expect(result.skipped).toContain('FOO');
  });

  it('applies prefix to target keys', () => {
    const env = {};
    const defaults = { HOST: 'localhost' };
    const result = applyDefaults2(env, defaults, { prefix: 'APP_' });
    expect(result.result['APP_HOST']).toBe('localhost');
    expect(result.applied).toContain('APP_HOST');
  });
});

describe('getMissingDefaults2', () => {
  it('returns keys missing from env', () => {
    const env = { FOO: 'bar' };
    const defaults = { FOO: 'x', BAZ: 'y' };
    expect(getMissingDefaults2(env, defaults)).toEqual({ BAZ: 'y' });
  });

  it('includes empty string keys', () => {
    const env = { FOO: '' };
    const defaults = { FOO: 'fallback' };
    expect(getMissingDefaults2(env, defaults)).toEqual({ FOO: 'fallback' });
  });

  it('returns empty object when all present', () => {
    const env = { A: '1', B: '2' };
    const defaults = { A: 'x', B: 'y' };
    expect(getMissingDefaults2(env, defaults)).toEqual({});
  });
});

describe('formatDefaults2Result', () => {
  it('shows applied and skipped', () => {
    const result = {
      original: {},
      result: {},
      applied: ['BAZ'],
      skipped: ['FOO'],
    };
    const output = formatDefaults2Result(result);
    expect(output).toContain('BAZ');
    expect(output).toContain('FOO');
  });

  it('shows no defaults applied message', () => {
    const result = { original: {}, result: {}, applied: [], skipped: [] };
    expect(formatDefaults2Result(result)).toBe('No defaults applied.');
  });
});
