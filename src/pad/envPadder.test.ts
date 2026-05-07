import { padValue, padEnv, formatPadResult } from './envPadder';

describe('padValue', () => {
  it('pads end by default', () => {
    expect(padValue('hi', 5)).toBe('hi   ');
  });

  it('pads start', () => {
    expect(padValue('hi', 5, '0', 'start')).toBe('000hi');
  });

  it('pads both sides', () => {
    expect(padValue('hi', 6, '-', 'both')).toBe('--hi--');
  });

  it('pads both sides with odd padding (extra at end)', () => {
    expect(padValue('hi', 5, '-', 'both')).toBe('-hi--');
  });

  it('returns value unchanged if already at or above length', () => {
    expect(padValue('hello', 3)).toBe('hello');
    expect(padValue('hello', 5)).toBe('hello');
  });
});

describe('padEnv', () => {
  const env = { FOO: 'ab', BAR: 'xyz', BAZ: 'hello' };

  it('pads all values to given length', () => {
    const result = padEnv(env, { length: 5 });
    expect(result.padded.FOO).toBe('ab   ');
    expect(result.padded.BAR).toBe('xyz  ');
    expect(result.padded.BAZ).toBe('hello');
    expect(result.changed).toContain('FOO');
    expect(result.changed).toContain('BAR');
    expect(result.changed).not.toContain('BAZ');
  });

  it('pads only specified keys', () => {
    const result = padEnv(env, { length: 5, keys: ['FOO'] });
    expect(result.padded.FOO).toBe('ab   ');
    expect(result.padded.BAR).toBe('xyz');
    expect(result.changed).toEqual(['FOO']);
  });

  it('uses custom char and direction', () => {
    const result = padEnv(env, { length: 5, char: '0', direction: 'start' });
    expect(result.padded.FOO).toBe('000ab');
  });

  it('ignores keys not in env', () => {
    const result = padEnv(env, { length: 5, keys: ['MISSING'] });
    expect(result.changed).toHaveLength(0);
  });

  it('returns empty changed array when nothing needs padding', () => {
    const result = padEnv({ KEY: 'value' }, { length: 3 });
    expect(result.changed).toHaveLength(0);
  });
});

describe('formatPadResult', () => {
  it('reports no changes when nothing was padded', () => {
    const result = { original: { A: 'hi' }, padded: { A: 'hi' }, changed: [] };
    expect(formatPadResult(result)).toBe('No values needed padding.');
  });

  it('lists changed keys', () => {
    const result = {
      original: { A: 'hi' },
      padded: { A: 'hi   ' },
      changed: ['A'],
    };
    const output = formatPadResult(result);
    expect(output).toContain('Padded 1 value(s)');
    expect(output).toContain('A');
    expect(output).toContain('hi');
    expect(output).toContain('hi   ');
  });
});
