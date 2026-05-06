import { maskValue4, maskEnv4, formatMask4Result } from './envMask4';

describe('maskValue4', () => {
  it('masks short values entirely', () => {
    expect(maskValue4('abc')).toBe('***');
  });

  it('masks with default visible start/end', () => {
    const result = maskValue4('secretvalue');
    expect(result).toBe('se*******ue');
  });

  it('uses custom mask char', () => {
    const result = maskValue4('secretvalue', { char: '#' });
    expect(result).toBe('se#######ue');
  });

  it('uses custom visibleStart and visibleEnd', () => {
    const result = maskValue4('secretvalue', { visibleStart: 3, visibleEnd: 1 });
    expect(result).toBe('sec*******e');
  });

  it('handles visibleEnd of 0', () => {
    const result = maskValue4('secretvalue', { visibleEnd: 0 });
    expect(result).toBe('se*********');
  });

  it('masks value at exactly minLength', () => {
    const result = maskValue4('abcd', { minLength: 4 });
    expect(result).toBe('****');
  });
});

describe('maskEnv4', () => {
  const env = { API_KEY: 'supersecret', DB_PASS: 'mypassword', NAME: 'visible' };

  it('masks specified keys', () => {
    const result = maskEnv4(env, ['API_KEY', 'DB_PASS']);
    expect(result.masked['API_KEY']).toBe('su*********et');
    expect(result.masked['DB_PASS']).toBe('my******rd');
    expect(result.masked['NAME']).toBe('visible');
  });

  it('tracks maskedKeys', () => {
    const result = maskEnv4(env, ['API_KEY']);
    expect(result.maskedKeys).toEqual(['API_KEY']);
  });

  it('ignores keys not in env', () => {
    const result = maskEnv4(env, ['MISSING_KEY']);
    expect(result.maskedKeys).toHaveLength(0);
  });

  it('preserves original env', () => {
    const result = maskEnv4(env, ['API_KEY']);
    expect(result.original['API_KEY']).toBe('supersecret');
  });
});

describe('formatMask4Result', () => {
  it('formats the result with masked keys', () => {
    const env = { TOKEN: 'abcdefgh' };
    const result = maskEnv4(env, ['TOKEN']);
    const output = formatMask4Result(result);
    expect(output).toContain('Masked 1 key(s):');
    expect(output).toContain('TOKEN');
    expect(output).toContain('→');
  });

  it('shows zero masked keys when none match', () => {
    const env = { TOKEN: 'abcdefgh' };
    const result = maskEnv4(env, []);
    const output = formatMask4Result(result);
    expect(output).toContain('Masked 0 key(s):');
  });
});
