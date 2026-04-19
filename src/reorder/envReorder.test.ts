import { reorderKeys, reorderByPattern, formatReorderResult } from './envReorder';

describe('reorderKeys', () => {
  const env = { C: '3', A: '1', B: '2', D: '4' };

  it('reorders keys by specified order', () => {
    const result = reorderKeys(env, ['A', 'B', 'C', 'D']);
    expect(Object.keys(result)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('appends keys not in order at the end', () => {
    const result = reorderKeys(env, ['A', 'C']);
    expect(Object.keys(result)).toEqual(['A', 'C', 'B', 'D']);
  });

  it('ignores keys in order that do not exist in env', () => {
    const result = reorderKeys(env, ['Z', 'A']);
    expect(Object.keys(result)).toEqual(['A', 'C', 'B', 'D']);
  });

  it('preserves values', () => {
    const result = reorderKeys(env, ['A', 'B']);
    expect(result['A']).toBe('1');
    expect(result['B']).toBe('2');
  });
});

describe('reorderByPattern', () => {
  const env = { DB_HOST: 'localhost', APP_NAME: 'test', DB_PORT: '5432', APP_ENV: 'dev' };

  it('moves matching keys to front', () => {
    const result = reorderByPattern(env, ['^APP_']);
    const keys = Object.keys(result);
    expect(keys[0]).toBe('APP_NAME');
    expect(keys[1]).toBe('APP_ENV');
  });

  it('keeps unmatched keys after matched', () => {
    const result = reorderByPattern(env, ['^APP_']);
    const keys = Object.keys(result);
    expect(keys).toContain('DB_HOST');
    expect(keys).toContain('DB_PORT');
  });
});

describe('formatReorderResult', () => {
  it('formats reorder result with moved keys', () => {
    const original = { C: '3', A: '1', B: '2' };
    const reordered = { A: '1', B: '2', C: '3' };
    const output = formatReorderResult({ original, reordered, order: ['A', 'B', 'C'] });
    expect(output).toContain('Reordered');
  });

  it('shows no moves when order is unchanged', () => {
    const env = { A: '1', B: '2' };
    const output = formatReorderResult({ original: env, reordered: env, order: ['A', 'B'] });
    expect(output).toContain('2 keys');
  });
});
