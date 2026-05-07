import { clampValue, clampEnv, formatClampResult } from './envClamper';

describe('clampValue', () => {
  it('clamps value below min', () => {
    expect(clampValue('5', 10)).toBe('10');
  });

  it('clamps value above max', () => {
    expect(clampValue('100', undefined, 50)).toBe('50');
  });

  it('returns value unchanged when within range', () => {
    expect(clampValue('25', 10, 50)).toBe('25');
  });

  it('returns original string for non-numeric values', () => {
    expect(clampValue('hello', 0, 100)).toBe('hello');
  });

  it('handles float values', () => {
    expect(clampValue('3.14', 0, 3)).toBe('3');
  });

  it('returns value unchanged when no bounds given', () => {
    expect(clampValue('42')).toBe('42');
  });
});

describe('clampEnv', () => {
  const env = { PORT: '9999', TIMEOUT: '5', NAME: 'app', RETRIES: '0' };

  it('clamps all numeric values within range', () => {
    const result = clampEnv(env, { min: 1, max: 100 });
    expect(result.clamped.PORT).toBe('100');
    expect(result.clamped.TIMEOUT).toBe('5');
    expect(result.clamped.RETRIES).toBe('1');
    expect(result.clamped.NAME).toBe('app');
  });

  it('only clamps specified keys', () => {
    const result = clampEnv(env, { min: 1, max: 100, keys: ['RETRIES'] });
    expect(result.clamped.RETRIES).toBe('1');
    expect(result.clamped.PORT).toBe('9999');
  });

  it('tracks changed keys', () => {
    const result = clampEnv(env, { min: 1, max: 100 });
    expect(result.changed).toContain('PORT');
    expect(result.changed).toContain('RETRIES');
    expect(result.changed).not.toContain('TIMEOUT');
    expect(result.changed).not.toContain('NAME');
  });

  it('returns empty changed array when nothing clamped', () => {
    const result = clampEnv({ A: 'hello' }, { min: 0, max: 10 });
    expect(result.changed).toHaveLength(0);
  });
});

describe('formatClampResult', () => {
  it('returns message when nothing changed', () => {
    const result = { original: {}, clamped: {}, changed: [] };
    expect(formatClampResult(result)).toBe('No values were clamped.');
  });

  it('formats changed values', () => {
    const result = {
      original: { PORT: '9999' },
      clamped: { PORT: '100' },
      changed: ['PORT'],
    };
    const output = formatClampResult(result);
    expect(output).toContain('Clamped 1 value(s)');
    expect(output).toContain('PORT: 9999 → 100');
  });
});
