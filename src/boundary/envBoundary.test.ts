import { checkBoundary, checkBoundaries, formatBoundaryResult } from './envBoundary';

describe('checkBoundary', () => {
  it('passes when value is within min/max', () => {
    const result = checkBoundary('KEY', 'hello', { min: 3, max: 10 });
    expect(result.withinBounds).toBe(true);
  });

  it('fails when value is below min', () => {
    const result = checkBoundary('KEY', 'hi', { min: 5 });
    expect(result.withinBounds).toBe(false);
    expect(result.reason).toContain('below minimum');
  });

  it('fails when value exceeds max', () => {
    const result = checkBoundary('KEY', 'toolongvalue', { max: 5 });
    expect(result.withinBounds).toBe(false);
    expect(result.reason).toContain('exceeds maximum');
  });

  it('fails when value does not match pattern', () => {
    const result = checkBoundary('KEY', 'abc123', { pattern: /^[a-z]+$/ });
    expect(result.withinBounds).toBe(false);
    expect(result.reason).toContain('does not match pattern');
  });

  it('passes when value matches pattern', () => {
    const result = checkBoundary('KEY', 'abc', { pattern: /^[a-z]+$/ });
    expect(result.withinBounds).toBe(true);
  });
});

describe('checkBoundaries', () => {
  it('returns within bounds for keys without rules', () => {
    const results = checkBoundaries({ FOO: 'bar' }, {});
    expect(results[0].withinBounds).toBe(true);
  });

  it('applies rules to matching keys', () => {
    const results = checkBoundaries({ PORT: '99999' }, { PORT: { max: 5 } });
    expect(results[0].withinBounds).toBe(false);
  });
});

describe('formatBoundaryResult', () => {
  it('returns success message when all within bounds', () => {
    const results = [{ key: 'A', value: 'x', withinBounds: true }];
    expect(formatBoundaryResult(results)).toBe('All values are within bounds.');
  });

  it('lists violations', () => {
    const results = [{ key: 'A', value: 'x', withinBounds: false, reason: 'too short' }];
    const output = formatBoundaryResult(results);
    expect(output).toContain('A');
    expect(output).toContain('too short');
  });
});
