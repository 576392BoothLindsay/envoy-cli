import { inheritEnv, formatInheritResult } from './envInherit';

describe('inheritEnv', () => {
  const base = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };
  const override = { HOST: 'prod.example.com', PORT: '3000', NEW_KEY: 'value' };

  it('merges override into base', () => {
    const result = inheritEnv(base, override);
    expect(result.merged.HOST).toBe('prod.example.com');
    expect(result.merged.PORT).toBe('3000');
    expect(result.merged.DEBUG).toBe('false');
    expect(result.merged.NEW_KEY).toBe('value');
  });

  it('tracks overridden keys', () => {
    const result = inheritEnv(base, override);
    expect(result.overridden).toContain('HOST');
    expect(result.overridden).not.toContain('PORT');
  });

  it('tracks inherited keys', () => {
    const result = inheritEnv(base, override);
    expect(result.inherited).toContain('DEBUG');
    expect(result.inherited).toContain('PORT');
  });

  it('tracks added keys', () => {
    const result = inheritEnv(base, override);
    expect(result.added).toContain('NEW_KEY');
  });

  it('handles empty override', () => {
    const result = inheritEnv(base, {});
    expect(result.merged).toEqual(base);
    expect(result.overridden).toHaveLength(0);
    expect(result.added).toHaveLength(0);
  });

  it('handles empty base', () => {
    const result = inheritEnv({}, override);
    expect(result.added).toHaveLength(Object.keys(override).length);
    expect(result.inherited).toHaveLength(0);
  });
});

describe('formatInheritResult', () => {
  it('formats result with all sections', () => {
    const base = { A: '1', B: '2' };
    const override = { A: 'new', C: '3' };
    const result = inheritEnv(base, override);
    const formatted = formatInheritResult(result);
    expect(formatted).toContain('Inherited');
    expect(formatted).toContain('Overridden');
    expect(formatted).toContain('Added');
  });

  it('omits empty sections', () => {
    const result = inheritEnv({ A: '1' }, { A: '1' });
    const formatted = formatInheritResult(result);
    expect(formatted).not.toContain('Overridden');
    expect(formatted).not.toContain('Added');
  });
});
