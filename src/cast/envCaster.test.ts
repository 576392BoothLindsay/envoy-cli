import { castValue, castEnv, formatCastResult } from './envCaster';

describe('castValue', () => {
  it('casts to number', () => {
    expect(castValue('42', 'number')).toBe(42);
    expect(castValue('3.14', 'number')).toBe(3.14);
  });

  it('throws on invalid number', () => {
    expect(() => castValue('abc', 'number')).toThrow();
  });

  it('casts to boolean truthy values', () => {
    expect(castValue('true', 'boolean')).toBe(true);
    expect(castValue('1', 'boolean')).toBe(true);
    expect(castValue('yes', 'boolean')).toBe(true);
  });

  it('casts to boolean falsy values', () => {
    expect(castValue('false', 'boolean')).toBe(false);
    expect(castValue('0', 'boolean')).toBe(false);
    expect(castValue('no', 'boolean')).toBe(false);
  });

  it('throws on invalid boolean', () => {
    expect(() => castValue('maybe', 'boolean')).toThrow();
  });

  it('casts to json', () => {
    expect(castValue('{"a":1}', 'json')).toEqual({ a: 1 });
    expect(castValue('[1,2]', 'json')).toEqual([1, 2]);
  });

  it('throws on invalid json', () => {
    expect(() => castValue('{bad}', 'json')).toThrow();
  });

  it('casts to array', () => {
    expect(castValue('a,b,c', 'array')).toEqual(['a', 'b', 'c']);
    expect(castValue('x', 'array')).toEqual(['x']);
  });

  it('returns string as-is', () => {
    expect(castValue('hello', 'string')).toBe('hello');
  });
});

describe('castEnv', () => {
  const env = { PORT: '3000', DEBUG: 'true', TAGS: 'a,b', NAME: 'app' };

  it('casts specified keys', () => {
    const result = castEnv(env, [
      { key: 'PORT', type: 'number' },
      { key: 'DEBUG', type: 'boolean' },
      { key: 'TAGS', type: 'array' },
    ]);
    expect(result.output.PORT).toBe(3000);
    expect(result.output.DEBUG).toBe(true);
    expect(result.output.TAGS).toEqual(['a', 'b']);
    expect(result.output.NAME).toBe('app');
    expect(result.failed).toHaveLength(0);
  });

  it('records failures', () => {
    const result = castEnv({ BAD: 'notanumber' }, [{ key: 'BAD', type: 'number' }]);
    expect(result.failed).toContain('BAD');
    expect(result.results[0].success).toBe(false);
  });

  it('skips missing keys', () => {
    const result = castEnv({}, [{ key: 'MISSING', type: 'number' }]);
    expect(result.results).toHaveLength(0);
  });
});

describe('formatCastResult', () => {
  it('formats success and failure', () => {
    const result = castEnv({ PORT: '3000', BAD: 'x' }, [
      { key: 'PORT', type: 'number' },
      { key: 'BAD', type: 'number' },
    ]);
    const out = formatCastResult(result);
    expect(out).toContain('PORT');
    expect(out).toContain('BAD');
    expect(out).toContain('Failed');
  });
});
