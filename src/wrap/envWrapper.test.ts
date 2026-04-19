import { wrapValue, wrapEnv, formatWrapResult } from './envWrapper';

describe('wrapValue', () => {
  it('adds prefix', () => {
    expect(wrapValue('hello', { prefix: 'pre_' })).toBe('pre_hello');
  });

  it('adds suffix', () => {
    expect(wrapValue('hello', { suffix: '_end' })).toBe('hello_end');
  });

  it('wraps with single quotes', () => {
    expect(wrapValue('hello', { quote: 'single' })).toBe("'hello'");
  });

  it('wraps with double quotes', () => {
    expect(wrapValue('hello', { quote: 'double' })).toBe('"hello"');
  });

  it('applies prefix after quoting', () => {
    expect(wrapValue('val', { quote: 'single', prefix: 'X' })).toBe("X'val'");
  });

  it('returns unchanged with no options', () => {
    expect(wrapValue('hello', {})).toBe('hello');
  });
});

describe('wrapEnv', () => {
  const env = { FOO: 'bar', BAZ: 'qux', OTHER: 'val' };

  it('wraps specified keys', () => {
    const result = wrapEnv(env, ['FOO', 'BAZ'], { prefix: '[', suffix: ']' });
    expect(result.wrapped['FOO']).toBe('[bar]');
    expect(result.wrapped['BAZ']).toBe('[qux]');
    expect(result.wrapped['OTHER']).toBe('val');
  });

  it('tracks changed keys', () => {
    const result = wrapEnv(env, ['FOO'], { quote: 'double' });
    expect(result.changed).toContain('FOO');
    expect(result.changed).not.toContain('OTHER');
  });

  it('ignores missing keys', () => {
    const result = wrapEnv(env, ['MISSING'], { prefix: 'x' });
    expect(result.changed).toHaveLength(0);
  });

  it('preserves original', () => {
    const result = wrapEnv(env, ['FOO'], { prefix: 'p' });
    expect(result.original['FOO']).toBe('bar');
  });
});

describe('formatWrapResult', () => {
  it('returns message when nothing changed', () => {
    const result = { original: {}, wrapped: {}, changed: [] };
    expect(formatWrapResult(result)).toBe('No values were wrapped.');
  });

  it('formats changed keys', () => {
    const result = {
      original: { FOO: 'bar' },
      wrapped: { FOO: '[bar]' },
      changed: ['FOO'],
    };
    const output = formatWrapResult(result);
    expect(output).toContain('FOO');
    expect(output).toContain('bar');
    expect(output).toContain('[bar]');
  });
});
