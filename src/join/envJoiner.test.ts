import { joinEnv, formatJoinResult } from './envJoiner';

describe('joinEnv', () => {
  const env = {
    DB_HOST_1: 'host1',
    DB_HOST_2: 'host2',
    DB_HOST_3: 'host3',
    REDIS_URL_1: 'redis://a',
    REDIS_URL_2: 'redis://b',
    STANDALONE: 'value',
  };

  it('groups keys with numeric suffixes and joins values', () => {
    const result = joinEnv(env);
    expect(result.joined['DB_HOST']).toBe('host1,host2,host3');
    expect(result.joined['REDIS_URL']).toBe('redis://a,redis://b');
    expect(result.count).toBe(2);
  });

  it('respects custom separator', () => {
    const result = joinEnv(env, { separator: '|' });
    expect(result.joined['DB_HOST']).toBe('host1|host2|host3');
  });

  it('filters by prefix', () => {
    const result = joinEnv(env, { prefix: 'DB_' });
    expect(result.keys).toContain('DB_HOST');
    expect(result.keys).not.toContain('REDIS_URL');
  });

  it('filters by keys array', () => {
    const result = joinEnv(env, { keys: ['REDIS_URL'] });
    expect(result.keys).toContain('REDIS_URL');
    expect(result.keys).not.toContain('DB_HOST');
  });

  it('returns empty result when no groups found', () => {
    const result = joinEnv({ STANDALONE: 'value' });
    expect(result.count).toBe(0);
    expect(result.joined).toEqual({});
  });

  it('ignores non-numeric suffixed keys', () => {
    const result = joinEnv({ KEY_A: 'val', KEY_B: 'val2' });
    expect(result.count).toBe(0);
  });
});

describe('formatJoinResult', () => {
  it('formats result with joined keys', () => {
    const result = { joined: { DB_HOST: 'host1,host2' }, count: 1, keys: ['DB_HOST'] };
    const output = formatJoinResult(result);
    expect(output).toContain('Joined 1 key group(s)');
    expect(output).toContain('DB_HOST = host1,host2');
  });

  it('shows message when no groups found', () => {
    const output = formatJoinResult({ joined: {}, count: 0, keys: [] });
    expect(output).toBe('No joinable key groups found.');
  });
});
