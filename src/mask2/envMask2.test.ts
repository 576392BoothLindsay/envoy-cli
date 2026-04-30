import { maskValue2, maskEnv2, formatMask2Result } from './envMask2';

describe('maskValue2', () => {
  it('masks full value by default', () => {
    expect(maskValue2('secret')).toBe('******');
  });

  it('uses custom mask char', () => {
    expect(maskValue2('abc', { char: '#' })).toBe('###');
  });

  it('masks with fixed length strategy', () => {
    expect(maskValue2('hello', { strategy: 'length' })).toBe('********');
  });

  it('masks partially showing start and end', () => {
    expect(maskValue2('mysecretvalue', { strategy: 'partial', visibleStart: 2, visibleEnd: 2 })).toBe('my*********ue');
  });

  it('fully masks short values in partial mode', () => {
    expect(maskValue2('ab', { strategy: 'partial', visibleStart: 2, visibleEnd: 2 })).toBe('**');
  });

  it('returns empty string unchanged', () => {
    expect(maskValue2('')).toBe('');
  });
});

describe('maskEnv2', () => {
  const env = { API_KEY: 'abc123', DB_PASS: 'hunter2', NAME: 'alice' };

  it('masks specified keys', () => {
    const result = maskEnv2(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).toBe('******');
    expect(result.masked['DB_PASS']).toBe('*******');
    expect(result.masked['NAME']).toBe('alice');
  });

  it('records masked keys', () => {
    const result = maskEnv2(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv2(env, ['MISSING']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv2(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('abc123');
  });
});

describe('formatMask2Result', () => {
  it('returns message when nothing masked', () => {
    const result = { original: {}, masked: {}, maskedKeys: [] };
    expect(formatMask2Result(result)).toBe('No keys masked.');
  });

  it('formats masked keys', () => {
    const result = {
      original: { API_KEY: 'abc123' },
      masked: { API_KEY: '******' },
      maskedKeys: ['API_KEY'],
    };
    const output = formatMask2Result(result);
    expect(output).toContain('Masked 1 key(s)');
    expect(output).toContain('API_KEY');
    expect(output).toContain('abc123 →');
  });
});
