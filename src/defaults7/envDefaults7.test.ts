import { applyDefaults7, getMissingDefaults7, formatDefaults7Result } from './envDefaults7';

describe('applyDefaults7', () => {
  const env = { FOO: 'foo', BAR: 'bar' };
  const defaults = { BAR: 'default_bar', BAZ: 'default_baz', QUX: 'default_qux' };

  it('applies defaults for missing keys only by default', () => {
    const result = applyDefaults7(env, defaults);
    expect(result.merged.BAZ).toBe('default_baz');
    expect(result.merged.QUX).toBe('default_qux');
    expect(result.merged.BAR).toBe('bar'); // not overridden
    expect(result.applied).toEqual(expect.arrayContaining(['BAZ', 'QUX']));
    expect(result.skipped).toContain('BAR');
  });

  it('overrides existing keys when override=true', () => {
    const result = applyDefaults7(env, defaults, true);
    expect(result.merged.BAR).toBe('default_bar');
    expect(result.applied).toContain('BAR');
    expect(result.skipped).toHaveLength(0);
  });

  it('does not mutate original env', () => {
    applyDefaults7(env, defaults);
    expect(env).toEqual({ FOO: 'foo', BAR: 'bar' });
  });

  it('returns empty applied/skipped when defaults is empty', () => {
    const result = applyDefaults7(env, {});
    expect(result.applied).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('getMissingDefaults7', () => {
  it('returns keys in defaults not present in env', () => {
    const env = { FOO: 'foo' };
    const defaults = { FOO: 'f', MISSING1: 'm1', MISSING2: 'm2' };
    const missing = getMissingDefaults7(env, defaults);
    expect(missing).toEqual(expect.arrayContaining(['MISSING1', 'MISSING2']));
    expect(missing).not.toContain('FOO');
  });

  it('returns empty array when all defaults are present', () => {
    const env = { A: '1', B: '2' };
    expect(getMissingDefaults7(env, { A: 'x', B: 'y' })).toHaveLength(0);
  });
});

describe('formatDefaults7Result', () => {
  it('formats applied and skipped keys', () => {
    const result = applyDefaults7({ FOO: 'foo' }, { FOO: 'f', BAR: 'b' });
    const output = formatDefaults7Result(result);
    expect(output).toContain('Applied');
    expect(output).toContain('BAR');
    expect(output).toContain('Skipped');
    expect(output).toContain('FOO');
  });

  it('shows no-op message when nothing applied', () => {
    const result = applyDefaults7({}, {});
    expect(formatDefaults7Result(result)).toContain('No defaults applied.');
  });
});
