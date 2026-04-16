import { addPrefix, removePrefix, hasPrefix, listKeysWithPrefix, formatPrefixResult } from './envPrefix';

const env = {
  FOO: 'foo',
  BAR: 'bar',
  APP_BAZ: 'baz',
};

describe('addPrefix', () => {
  it('adds prefix to all keys', () => {
    const result = addPrefix({ FOO: 'foo', BAR: 'bar' }, 'APP_');
    expect(result).toEqual({ APP_FOO: 'foo', APP_BAR: 'bar' });
  });

  it('returns empty object for empty env', () => {
    expect(addPrefix({}, 'PRE_')).toEqual({});
  });
});

describe('removePrefix', () => {
  it('removes prefix from matching keys', () => {
    const result = removePrefix({ APP_FOO: 'foo', APP_BAR: 'bar' }, 'APP_');
    expect(result).toEqual({ FOO: 'foo', BAR: 'bar' });
  });

  it('leaves non-matching keys unchanged', () => {
    const result = removePrefix(env, 'APP_');
    expect(result['FOO']).toBe('foo');
    expect(result['BAR']).toBe('bar');
    expect(result['BAZ']).toBe('baz');
    expect(result['APP_BAZ']).toBeUndefined();
  });
});

describe('hasPrefix', () => {
  it('returns true when key starts with prefix', () => {
    expect(hasPrefix('APP_FOO', 'APP_')).toBe(true);
  });

  it('returns false when key does not start with prefix', () => {
    expect(hasPrefix('FOO', 'APP_')).toBe(false);
  });
});

describe('listKeysWithPrefix', () => {
  it('returns only keys matching prefix', () => {
    expect(listKeysWithPrefix(env, 'APP_')).toEqual(['APP_BAZ']);
  });

  it('returns empty array if no matches', () => {
    expect(listKeysWithPrefix(env, 'XYZ_')).toEqual([]);
  });
});

describe('formatPrefixResult', () => {
  it('formats added keys', () => {
    const output = formatPrefixResult({ added: ['APP_FOO'], removed: [], env: {} });
    expect(output).toContain('Added prefix');
    expect(output).toContain('APP_FOO');
  });

  it('shows no keys affected when both lists empty', () => {
    const output = formatPrefixResult({ added: [], removed: [], env: {} });
    expect(output).toBe('No keys affected.');
  });
});
