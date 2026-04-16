import { coerceValue, coerceEnv, formatCoerceResult } from './envCoercer';

describe('coerceValue', () => {
  it('coerces truthy boolean strings', () => {
    expect(coerceValue('1', 'boolean')).toBe('true');
    expect(coerceValue('yes', 'boolean')).toBe('true');
    expect(coerceValue('TRUE', 'boolean')).toBe('true');
  });

  it('coerces falsy boolean strings', () => {
    expect(coerceValue('0', 'boolean')).toBe('false');
    expect(coerceValue('no', 'boolean')).toBe('false');
    expect(coerceValue('off', 'boolean')).toBe('false');
  });

  it('throws on invalid boolean', () => {
    expect(() => coerceValue('maybe', 'boolean')).toThrow();
  });

  it('coerces number strings', () => {
    expect(coerceValue('42', 'number')).toBe('42');
    expect(coerceValue('3.14', 'number')).toBe('3.14');
  });

  it('throws on invalid number', () => {
    expect(() => coerceValue('abc', 'number')).toThrow();
  });

  it('passes valid JSON', () => {
    expect(coerceValue('{"a":1}', 'json')).toBe('{"a":1}');
  });

  it('throws on invalid JSON', () => {
    expect(() => coerceValue('{bad}', 'json')).toThrow();
  });

  it('coerces to string', () => {
    expect(coerceValue('hello', 'string')).toBe('hello');
  });
});

describe('coerceEnv', () => {
  const env = { DEBUG: 'true', PORT: '3000', VERBOSE: 'yes', BAD: 'notanumber' };

  it('applies coercion rules', () => {
    const result = coerceEnv(env, [
      { key: 'PORT', type: 'number' },
      { key: 'VERBOSE', type: 'boolean' },
    ]);
    expect(result.coerced.PORT).toBe('3000');
    expect(result.coerced.VERBOSE).toBe('true');
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].key).toBe('VERBOSE');
  });

  it('records errors for invalid coercions', () => {
    const result = coerceEnv(env, [{ key: 'BAD', type: 'number' }]);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].key).toBe('BAD');
  });

  it('skips missing keys', () => {
    const result = coerceEnv(env, [{ key: 'MISSING', type: 'boolean' }]);
    expect(result.changes).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });
});

describe('formatCoerceResult', () => {
  it('formats changes and errors', () => {
    const result = {
      coerced: {},
      changes: [{ key: 'VERBOSE', from: 'yes', to: 'true', type: 'boolean' as const }],
      errors: [{ key: 'BAD', value: 'x', type: 'number' as const, reason: 'Cannot coerce' }],
    };
    const output = formatCoerceResult(result);
    expect(output).toContain('VERBOSE');
    expect(output).toContain('BAD');
  });

  it('shows no coercions message when empty', () => {
    const output = formatCoerceResult({ coerced: {}, changes: [], errors: [] });
    expect(output).toContain('No coercions applied.');
  });
});
