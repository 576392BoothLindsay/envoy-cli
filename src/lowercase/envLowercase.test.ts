import { describe, it, expect } from 'vitest';
import {
  lowercaseKeys,
  lowercaseValues,
  applyLowercase,
  getLowercaseResult,
  formatLowercaseResult,
} from './envLowercase';

describe('lowercaseKeys', () => {
  it('lowercases all keys', () => {
    const result = lowercaseKeys({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('leaves values unchanged', () => {
    const result = lowercaseKeys({ KEY: 'VALUE' });
    expect(result['key']).toBe('VALUE');
  });
});

describe('lowercaseValues', () => {
  it('lowercases all values', () => {
    const result = lowercaseValues({ foo: 'BAR', baz: 'QUX' });
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('leaves keys unchanged', () => {
    const result = lowercaseValues({ KEY: 'VALUE' });
    expect(result['KEY']).toBe('value');
  });
});

describe('applyLowercase', () => {
  it('defaults to keys', () => {
    const result = applyLowercase({ FOO: 'BAR' });
    expect(result).toHaveProperty('foo', 'BAR');
  });

  it('applies to values', () => {
    const result = applyLowercase({ FOO: 'BAR' }, 'values');
    expect(result).toHaveProperty('FOO', 'bar');
  });

  it('applies to both', () => {
    const result = applyLowercase({ FOO: 'BAR' }, 'both');
    expect(result).toHaveProperty('foo', 'bar');
  });
});

describe('getLowercaseResult', () => {
  it('tracks changed keys', () => {
    const result = getLowercaseResult({ FOO: 'bar', already: 'val' });
    expect(result.changedKeys).toContain('FOO');
    expect(result.changedKeys).not.toContain('already');
  });
});

describe('formatLowercaseResult', () => {
  it('formats result summary', () => {
    const result = getLowercaseResult({ FOO: 'bar', BAR: 'baz' });
    const output = formatLowercaseResult(result);
    expect(output).toContain('2 key(s)');
    expect(output).toContain('FOO');
  });

  it('shows zero when nothing changed', () => {
    const result = getLowercaseResult({ foo: 'bar' });
    const output = formatLowercaseResult(result);
    expect(output).toContain('0 key(s)');
  });
});
