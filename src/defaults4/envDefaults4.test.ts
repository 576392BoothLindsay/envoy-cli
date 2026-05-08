import { applyDefaults4, getMissingDefaults4, formatDefaults4Result } from './envDefaults4';

describe('applyDefaults4', () => {
  const env = { FOO: 'foo', BAR: '' };
  const defaults = { BAR: 'bar_default', BAZ: 'baz_default', FOO: 'foo_default' };

  it('applies defaults for missing and blank keys', () => {
    const result = applyDefaults4(env, defaults);
    expect(result.result.BAR).toBe('bar_default');
    expect(result.result.BAZ).toBe('baz_default');
    expect(result.result.FOO).toBe('foo');
    expect(result.applied).toContain('BAR');
    expect(result.applied).toContain('BAZ');
    expect(result.skipped).toContain('FOO');
  });

  it('overrides existing values when override=true', () => {
    const result = applyDefaults4(env, defaults, { override: true });
    expect(result.result.FOO).toBe('foo_default');
    expect(result.applied).toContain('FOO');
  });

  it('only applies defaults for specified keys', () => {
    const result = applyDefaults4(env, defaults, { keys: ['BAZ'] });
    expect(result.result.BAZ).toBe('baz_default');
    expect(result.applied).toEqual(['BAZ']);
    expect(result.skipped).toEqual([]);
  });

  it('does not apply defaults for keys not in defaults map', () => {
    const result = applyDefaults4(env, defaults, { keys: ['NONEXISTENT'] });
    expect(result.applied).toHaveLength(0);
  });

  it('preserves original env in result', () => {
    const result = applyDefaults4(env, defaults);
    expect(result.original).toEqual(env);
    expect(result.defaults).toEqual(defaults);
  });
});

describe('getMissingDefaults4', () => {
  it('returns keys that are missing or blank', () => {
    const env = { FOO: 'foo', BAR: '' };
    const defaults = { FOO: 'f', BAR: 'b', BAZ: 'z' };
    const missing = getMissingDefaults4(env, defaults);
    expect(missing).toContain('BAR');
    expect(missing).toContain('BAZ');
    expect(missing).not.toContain('FOO');
  });

  it('returns empty array when all defaults are set', () => {
    const env = { FOO: 'foo' };
    const defaults = { FOO: 'fallback' };
    expect(getMissingDefaults4(env, defaults)).toHaveLength(0);
  });
});

describe('formatDefaults4Result', () => {
  it('formats applied and skipped keys', () => {
    const result = applyDefaults4({ FOO: 'foo' }, { FOO: 'f', BAR: 'b' });
    const output = formatDefaults4Result(result);
    expect(output).toContain('BAR');
    expect(output).toContain('FOO');
  });

  it('shows no defaults message when nothing to apply', () => {
    const result = applyDefaults4({}, {});
    const output = formatDefaults4Result(result);
    expect(output).toContain('No defaults to apply.');
  });
});
