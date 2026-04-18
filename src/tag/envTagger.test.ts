import { tagKeys, getTagsForKey, getKeysByTag, formatTagResult } from './envTagger';

const baseEnv = {
  API_KEY: 'abc123',
  DB_HOST: 'localhost',
  APP_NAME: 'myapp',
};

describe('tagKeys', () => {
  it('adds a tag to specified keys', () => {
    const result = tagKeys(baseEnv, ['API_KEY'], 'secret');
    expect(result['__TAG_API_KEY']).toBe('secret');
  });

  it('does not tag keys not in env', () => {
    const result = tagKeys(baseEnv, ['MISSING_KEY'], 'secret');
    expect(result['__TAG_MISSING_KEY']).toBeUndefined();
  });

  it('accumulates multiple tags', () => {
    let result = tagKeys(baseEnv, ['API_KEY'], 'secret');
    result = tagKeys(result, ['API_KEY'], 'sensitive');
    expect(result['__TAG_API_KEY']).toBe('secret,sensitive');
  });

  it('does not duplicate tags', () => {
    let result = tagKeys(baseEnv, ['API_KEY'], 'secret');
    result = tagKeys(result, ['API_KEY'], 'secret');
    expect(result['__TAG_API_KEY']).toBe('secret');
  });
});

describe('getTagsForKey', () => {
  it('returns tags for a key', () => {
    const env = tagKeys(baseEnv, ['API_KEY'], 'secret');
    expect(getTagsForKey(env, 'API_KEY')).toEqual(['secret']);
  });

  it('returns empty array for untagged key', () => {
    expect(getTagsForKey(baseEnv, 'API_KEY')).toEqual([]);
  });
});

describe('getKeysByTag', () => {
  it('returns keys with a given tag', () => {
    let env = tagKeys(baseEnv, ['API_KEY', 'DB_HOST'], 'infra');
    env = tagKeys(env, ['APP_NAME'], 'meta');
    const keys = getKeysByTag(env, 'infra');
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('DB_HOST');
    expect(keys).not.toContain('APP_NAME');
  });

  it('returns empty array if no keys match tag', () => {
    expect(getKeysByTag(baseEnv, 'nonexistent')).toEqual([]);
  });
});

describe('formatTagResult', () => {
  it('formats result with tag info', () => {
    const output = formatTagResult({
      tagged: { API_KEY: 'abc' },
      tags: { API_KEY: ['secret'] },
      count: 1,
    });
    expect(output).toContain('Tagged 1 key(s)');
    expect(output).toContain('API_KEY: [secret]');
  });
});
