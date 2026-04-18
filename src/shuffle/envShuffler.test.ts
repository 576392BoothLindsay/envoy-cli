import { shuffleEnv, formatShuffleResult } from './envShuffler';

const env = {
  ALPHA: 'a',
  BETA: 'b',
  GAMMA: 'c',
  DELTA: 'd',
  EPSILON: 'e',
};

describe('shuffleEnv', () => {
  it('returns all keys', () => {
    const result = shuffleEnv(env);
    expect(Object.keys(result).sort()).toEqual(Object.keys(env).sort());
  });

  it('returns all values intact', () => {
    const result = shuffleEnv(env);
    expect(Object.values(result).sort()).toEqual(Object.values(env).sort());
  });

  it('produces deterministic output with seed', () => {
    const r1 = shuffleEnv(env, 42);
    const r2 = shuffleEnv(env, 42);
    expect(Object.keys(r1)).toEqual(Object.keys(r2));
  });

  it('produces different output for different seeds', () => {
    const r1 = shuffleEnv(env, 1);
    const r2 = shuffleEnv(env, 9999);
    // Very unlikely to be equal
    expect(Object.keys(r1)).not.toEqual(Object.keys(r2));
  });

  it('handles empty env', () => {
    expect(shuffleEnv({})).toEqual({});
  });

  it('handles single key', () => {
    expect(shuffleEnv({ ONLY: 'one' })).toEqual({ ONLY: 'one' });
  });
});

describe('formatShuffleResult', () => {
  it('includes count and ordered keys', () => {
    const shuffled = shuffleEnv(env, 7);
    const result = {
      original: env,
      shuffled,
      count: Object.keys(env).length,
    };
    const output = formatShuffleResult(result);
    expect(output).toContain('Shuffled 5 key(s)');
    expect(output).toContain('New order:');
    Object.keys(shuffled).forEach((k, i) => {
      expect(output).toContain(`${i + 1}. ${k}`);
    });
  });
});
