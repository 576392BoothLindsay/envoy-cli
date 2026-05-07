import { applyDefaults3, getMissingDefaults3, formatDefaults3Result } from './envDefaults3';

describe('applyDefaults3', () => {
  const defaults = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };

  it('applies defaults for missing keys', () => {
    const result = applyDefaults3({}, defaults);
    expect(result.applied).toEqual(defaults);
    expect(result.skipped).toEqual({});
    expect(result.final).toEqual(defaults);
  });

  it('skips keys that already have non-empty values', () => {
    const env = { HOST: 'example.com', PORT: '8080', DEBUG: 'true' };
    const result = applyDefaults3(env, defaults);
    expect(result.applied).toEqual({});
    expect(result.skipped).toEqual(env);
    expect(result.final).toEqual(env);
  });

  it('applies defaults for empty values when overwriteEmpty is true', () => {
    const env = { HOST: '', PORT: '8080' };
    const result = applyDefaults3(env, defaults, true);
    expect(result.applied['HOST']).toBe('localhost');
    expect(result.applied['DEBUG']).toBe('false');
    expect(result.skipped['PORT']).toBe('8080');
  });

  it('does not overwrite empty values when overwriteEmpty is false', () => {
    const env = { HOST: '' };
    const result = applyDefaults3(env, { HOST: 'localhost' }, false);
    expect(result.applied).toEqual({});
    expect(result.skipped['HOST']).toBe('');
  });

  it('preserves existing env keys not in defaults', () => {
    const env = { EXTRA: 'value' };
    const result = applyDefaults3(env, defaults);
    expect(result.final['EXTRA']).toBe('value');
  });
});

describe('getMissingDefaults3', () => {
  it('returns keys missing from env', () => {
    const missing = getMissingDefaults3({}, { A: '1', B: '2' });
    expect(missing).toEqual(['A', 'B']);
  });

  it('returns empty keys when includeEmpty is true', () => {
    const env = { A: '' };
    const missing = getMissingDefaults3(env, { A: '1', B: '2' }, true);
    expect(missing).toContain('A');
    expect(missing).toContain('B');
  });

  it('does not return empty keys when includeEmpty is false', () => {
    const env = { A: '' };
    const missing = getMissingDefaults3(env, { A: '1' }, false);
    expect(missing).not.toContain('A');
  });
});

describe('formatDefaults3Result', () => {
  it('shows applied and skipped keys', () => {
    const result = {
      applied: { HOST: 'localhost' },
      skipped: { PORT: '8080' },
      final: { HOST: 'localhost', PORT: '8080' },
    };
    const output = formatDefaults3Result(result);
    expect(output).toContain('Applied 1 default(s)');
    expect(output).toContain('+ HOST=localhost');
    expect(output).toContain('Skipped 1 key(s)');
    expect(output).toContain('~ PORT=8080');
  });

  it('shows message when no defaults applied', () => {
    const result = { applied: {}, skipped: { A: 'x' }, final: { A: 'x' } };
    const output = formatDefaults3Result(result);
    expect(output).toContain('No defaults applied.');
  });
});
