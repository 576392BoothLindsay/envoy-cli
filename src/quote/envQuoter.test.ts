import { quoteValue, unquoteValue, quoteEnv, formatQuoteResult } from './envQuoter';

describe('quoteValue', () => {
  it('should return value unchanged when no special chars and style is auto', () => {
    expect(quoteValue('hello', 'auto')).toBe('hello');
  });

  it('should double-quote values with spaces in auto mode', () => {
    expect(quoteValue('hello world', 'auto')).toBe('"hello world"');
  });

  it('should double-quote empty string', () => {
    expect(quoteValue('', 'auto')).toBe('""');
  });

  it('should single-quote when style is single', () => {
    expect(quoteValue('hello world', 'single')).toBe("'hello world'");
  });

  it('should always double-quote when style is double', () => {
    expect(quoteValue('simple', 'double')).toBe('"simple"');
  });

  it('should return value unchanged when style is none', () => {
    expect(quoteValue('hello world', 'none')).toBe('hello world');
  });

  it('should escape double quotes inside double-quoted value', () => {
    expect(quoteValue('say "hi"', 'double')).toBe('"say \\"hi\\""');
  });

  it('should quote values containing # character', () => {
    expect(quoteValue('foo#bar', 'auto')).toBe('"foo#bar"');
  });
});

describe('unquoteValue', () => {
  it('should remove double quotes', () => {
    expect(unquoteValue('"hello world"')).toBe('hello world');
  });

  it('should remove single quotes', () => {
    expect(unquoteValue("'hello world'")).toBe('hello world');
  });

  it('should return plain value unchanged', () => {
    expect(unquoteValue('simple')).toBe('simple');
  });

  it('should unescape escaped double quotes', () => {
    expect(unquoteValue('"say \\"hi\\""')).toBe('say "hi"');
  });
});

describe('quoteEnv', () => {
  const env = { NAME: 'John Doe', PORT: '3000', MSG: 'hello #world' };

  it('should quote values that need quoting in auto mode', () => {
    const result = quoteEnv(env);
    expect(result.quoted.NAME).toBe('"John Doe"');
    expect(result.quoted.PORT).toBe('3000');
    expect(result.quoted.MSG).toBe('"hello #world"');
    expect(result.changed).toContain('NAME');
    expect(result.changed).not.toContain('PORT');
  });

  it('should only quote specified keys', () => {
    const result = quoteEnv(env, { keys: ['PORT'], style: 'double' });
    expect(result.quoted.PORT).toBe('"3000"');
    expect(result.quoted.NAME).toBe('John Doe');
  });

  it('should force-quote all values when forceAll is true', () => {
    const result = quoteEnv(env, { forceAll: true, style: 'double' });
    expect(result.changed.length).toBe(Object.keys(env).length);
  });
});

describe('formatQuoteResult', () => {
  it('should return message when nothing changed', () => {
    const result = { original: { A: 'x' }, quoted: { A: 'x' }, changed: [] };
    expect(formatQuoteResult(result)).toBe('No values needed quoting.');
  });

  it('should list changed keys', () => {
    const result = { original: { A: 'hello world' }, quoted: { A: '"hello world"' }, changed: ['A'] };
    const output = formatQuoteResult(result);
    expect(output).toContain('Quoted 1 value(s)');
    expect(output).toContain('A');
  });
});
