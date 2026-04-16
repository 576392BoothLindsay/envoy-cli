import { uppercaseKeys, uppercaseValues, applyUppercase, formatUppercaseResult } from './envUppercase';

describe('uppercaseKeys', () => {
  it('converts all keys to uppercase', () => {
    const result = uppercaseKeys({ foo: 'bar', baz_qux: 'hello' });
    expect(result).toEqual({ FOO: 'bar', BAZ_QUX: 'hello' });
  });

  it('returns empty object for empty input', () => {
    expect(uppercaseKeys({})).toEqual({});
  });
});

describe('uppercaseValues', () => {
  it('converts all values to uppercase', () => {
    const result = uppercaseValues({ KEY: 'hello world', OTHER: 'test' });
    expect(result).toEqual({ KEY: 'HELLO WORLD', OTHER: 'TEST' });
  });
});

describe('applyUppercase', () => {
  const env = { foo: 'bar', baz: 'qux' };

  it('uppercases keys only', () => {
    const res = applyUppercase(env, 'keys');
    expect(res.result).toEqual({ FOO: 'bar', BAZ: 'qux' });
    expect(res.changed.length).toBeGreaterThan(0);
  });

  it('uppercases values only', () => {
    const res = applyUppercase(env, 'values');
    expect(res.result).toEqual({ foo: 'BAR', baz: 'QUX' });
  });

  it('uppercases both keys and values', () => {
    const res = applyUppercase(env, 'both');
    expect(res.result).toEqual({ FOO: 'BAR', BAZ: 'QUX' });
  });

  it('reports no changes when already uppercase', () => {
    const res = applyUppercase({ FOO: 'BAR' }, 'both');
    expect(res.changed).toHaveLength(0);
  });
});

describe('formatUppercaseResult', () => {
  it('shows no changes message', () => {
    const res = applyUppercase({ FOO: 'BAR' }, 'both');
    expect(formatUppercaseResult(res)).toBe('No changes made.');
  });

  it('lists changed entries', () => {
    const res = applyUppercase({ foo: 'bar' }, 'keys');
    const output = formatUppercaseResult(res);
    expect(output).toContain('Uppercased 1 entry');
  });
});
