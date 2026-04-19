import { unmaskEnv, isMasked, formatUnmaskResult } from './envUnmasker';

describe('isMasked', () => {
  it('returns true for all-asterisk string', () => {
    expect(isMasked('****')).toBe(true);
  });

  it('returns false for partial mask', () => {
    expect(isMasked('abc*')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isMasked('')).toBe(false);
  });

  it('supports custom mask char', () => {
    expect(isMasked('####', '#')).toBe(true);
    expect(isMasked('****', '#')).toBe(false);
  });
});

describe('unmaskEnv', () => {
  const masked = { API_KEY: '******', PORT: '3000', SECRET: '***' };
  const reference = { API_KEY: 'my-secret-key', SECRET: 'topsecret' };

  it('restores masked values from reference', () => {
    const result = unmaskEnv(masked, reference);
    expect(result.unmasked.API_KEY).toBe('my-secret-key');
    expect(result.unmasked.SECRET).toBe('topsecret');
  });

  it('leaves non-masked values unchanged', () => {
    const result = unmaskEnv(masked, reference);
    expect(result.unmasked.PORT).toBe('3000');
  });

  it('tracks restored keys', () => {
    const result = unmaskEnv(masked, reference);
    expect(result.restoredKeys).toContain('API_KEY');
    expect(result.restoredKeys).toContain('SECRET');
    expect(result.restoredKeys).not.toContain('PORT');
  });

  it('does not restore if key missing from reference', () => {
    const result = unmaskEnv({ MISSING: '***' }, {});
    expect(result.unmasked.MISSING).toBe('***');
    expect(result.restoredKeys).toHaveLength(0);
  });
});

describe('formatUnmaskResult', () => {
  it('returns message when nothing restored', () => {
    const result = unmaskEnv({ PORT: '3000' }, { PORT: '3000' });
    expect(formatUnmaskResult(result)).toMatch('No masked values');
  });

  it('lists restored keys', () => {
    const result = unmaskEnv({ API_KEY: '***' }, { API_KEY: 'secret' });
    expect(formatUnmaskResult(result)).toMatch('API_KEY');
    expect(formatUnmaskResult(result)).toMatch('1 key(s)');
  });
});
