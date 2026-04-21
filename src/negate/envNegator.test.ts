import { negateValue, negateEnv, formatNegateResult } from './envNegator';

describe('negateValue', () => {
  it('negates truthy values to false', () => {
    expect(negateValue('true')).toBe('false');
    expect(negateValue('1')).toBe('false');
    expect(negateValue('yes')).toBe('false');
    expect(negateValue('on')).toBe('false');
    expect(negateValue('enabled')).toBe('false');
  });

  it('negates falsy values to true', () => {
    expect(negateValue('false')).toBe('true');
    expect(negateValue('0')).toBe('true');
    expect(negateValue('no')).toBe('true');
    expect(negateValue('off')).toBe('true');
    expect(negateValue('disabled')).toBe('true');
  });

  it('is case-insensitive', () => {
    expect(negateValue('TRUE')).toBe('false');
    expect(negateValue('False')).toBe('true');
    expect(negateValue('YES')).toBe('false');
  });

  it('leaves non-boolean values unchanged', () => {
    expect(negateValue('hello')).toBe('hello');
    expect(negateValue('42')).toBe('42');
    expect(negateValue('')).toBe('');
  });
});

describe('negateEnv', () => {
  const env = {
    FEATURE_A: 'true',
    FEATURE_B: 'false',
    DEBUG: '1',
    NAME: 'myapp',
    PORT: '3000',
  };

  it('negates all boolean-like values when no keys specified', () => {
    const result = negateEnv(env);
    expect(result.negated.FEATURE_A).toBe('false');
    expect(result.negated.FEATURE_B).toBe('true');
    expect(result.negated.DEBUG).toBe('false');
    expect(result.negated.NAME).toBe('myapp');
    expect(result.negated.PORT).toBe('3000');
    expect(result.negatedKeys).toEqual(['FEATURE_A', 'FEATURE_B', 'DEBUG']);
  });

  it('negates only specified keys', () => {
    const result = negateEnv(env, ['FEATURE_A']);
    expect(result.negated.FEATURE_A).toBe('false');
    expect(result.negated.FEATURE_B).toBe('false');
    expect(result.negatedKeys).toEqual(['FEATURE_A']);
  });

  it('skips keys not present in env', () => {
    const result = negateEnv(env, ['MISSING_KEY']);
    expect(result.negatedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = negateEnv(env);
    expect(result.original).toEqual(env);
  });
});

describe('formatNegateResult', () => {
  it('returns message when no keys were negated', () => {
    const result = negateEnv({ NAME: 'myapp' });
    expect(formatNegateResult(result)).toBe('No boolean-like keys found to negate.');
  });

  it('formats negated keys correctly', () => {
    const result = negateEnv({ FEATURE: 'true', DEBUG: 'false' });
    const output = formatNegateResult(result);
    expect(output).toContain('Negated 2 key(s)');
    expect(output).toContain('FEATURE: true → false');
    expect(output).toContain('DEBUG: false → true');
  });
});
