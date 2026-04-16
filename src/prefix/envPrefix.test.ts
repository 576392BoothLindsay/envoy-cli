import { addPrefix, removePrefix, hasPrefix, listKeysWithPrefix, formatPrefixResult } from './envPrefix';

const env = { FOO: 'bar', BAZ: 'qux', APP_KEY: 'secret' };

describe('addPrefix', () => {
  it('adds prefix to all keys', () => {
    const result = addPrefix({ FOO: 'bar', BAZ: 'qux' }, 'APP_');
    expect(result).toEqual({ APP_FOO: 'bar', APP_BAZ: 'qux' });
  });

  it('does not double-add prefix', () => {
    const result = addPrefix({ APP_FOO: 'bar' }, 'APP_');
    expect(result).toEqual({ APP_FOO: 'bar' });
  });
});

describe('removePrefix', () => {
  it('removes prefix from matching keys', () => {
    const result = removePrefix({ APP_FOO: 'bar', APP_BAZ: 'qux' }, 'APP_');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('leaves non-matching keys unchanged', () => {
    const result = removePrefix({ FOO: 'bar', APP_BAZ: 'qux' }, 'APP_');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});

describe('hasPrefix', () => {
  it('returns true when key has prefix', () => {
    expect(hasPrefix('APP_FOO', 'APP_')).toBe(true);
  });

  it('returns false when key lacks prefix', () => {
    expect(hasPrefix('FOO', 'APP_')).toBe(false);
  });
});

describe('listKeysWithPrefix', () => {
  it('lists only keys with the given prefix', () => {
    const keys = listKeysWithPrefix(env, 'APP_');
    expect(keys).toEqual(['APP_KEY']);
  });

  it('returns empty array when no keys match', () => {
    expect(listKeysWithPrefix(env, 'XYZ_')).toEqual([]);
  });
});

describe('formatPrefixResult', () => {
  it('formats result with all fields', () => {
    const out = formatPrefixResult({ added: ['FOO'], removed: ['BAR'], unchanged: ['BAZ'] });
    expect(out).toContain('Added prefix to: FOO');
    expect(out).toContain('Removed prefix from: BAR');
    expect(out).toContain('Unchanged: BAZ');
  });

  it('omits empty sections', () => {
    const out = formatPrefixResult({ added: ['FOO'], removed: [], unchanged: [] });
    expect(out).not.toContain('Removed');
  });
});
