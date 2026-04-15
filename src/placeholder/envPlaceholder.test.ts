import {
  findPlaceholders,
  resolvePlaceholder,
  resolvePlaceholders,
  formatPlaceholderResult,
} from './envPlaceholder';

describe('findPlaceholders', () => {
  it('finds single placeholder', () => {
    expect(findPlaceholders('Hello {{NAME}}')).toEqual(['NAME']);
  });

  it('finds multiple placeholders', () => {
    expect(findPlaceholders('{{HOST}}:{{PORT}}')).toEqual(['HOST', 'PORT']);
  });

  it('returns empty array when no placeholders', () => {
    expect(findPlaceholders('no placeholders here')).toEqual([]);
  });

  it('supports custom prefix/suffix', () => {
    expect(findPlaceholders('Hello ${NAME}', '${', '}')).toEqual(['NAME']);
  });

  it('handles whitespace inside placeholders', () => {
    expect(findPlaceholders('{{ KEY }}')).toEqual(['KEY']);
  });
});

describe('resolvePlaceholder', () => {
  it('replaces known placeholder', () => {
    const { resolved, missing } = resolvePlaceholder('{{NAME}}', { NAME: 'world' });
    expect(resolved).toBe('world');
    expect(missing).toEqual([]);
  });

  it('reports missing placeholder', () => {
    const { resolved, missing } = resolvePlaceholder('{{MISSING}}', {});
    expect(resolved).toBe('{{MISSING}}');
    expect(missing).toContain('MISSING');
  });

  it('uses fallback for missing placeholder', () => {
    const { resolved } = resolvePlaceholder('{{MISSING}}', {}, { fallback: '' });
    expect(resolved).toBe('');
  });

  it('replaces multiple occurrences', () => {
    const { resolved } = resolvePlaceholder('{{A}}-{{B}}', { A: 'foo', B: 'bar' });
    expect(resolved).toBe('foo-bar');
  });
});

describe('resolvePlaceholders', () => {
  it('resolves all env values', () => {
    const env = { URL: 'http://{{HOST}}:{{PORT}}', NAME: '{{APP}}' };
    const context = { HOST: 'localhost', PORT: '3000', APP: 'myapp' };
    const result = resolvePlaceholders(env, context);
    expect(result.resolved.URL).toBe('http://localhost:3000');
    expect(result.resolved.NAME).toBe('myapp');
    expect(result.replaced).toBe(2);
    expect(result.missing).toEqual([]);
  });

  it('tracks unresolved placeholders', () => {
    const env = { KEY: '{{UNDEFINED}}' };
    const result = resolvePlaceholders(env, {});
    expect(result.missing).toContain('UNDEFINED');
  });

  it('counts replaced values correctly', () => {
    const env = { A: 'static', B: '{{X}}' };
    const result = resolvePlaceholders(env, { X: '1' });
    expect(result.replaced).toBe(1);
  });
});

describe('formatPlaceholderResult', () => {
  it('formats success result', () => {
    const output = formatPlaceholderResult({ resolved: {}, missing: [], replaced: 3 });
    expect(output).toContain('Replaced: 3');
    expect(output).toContain('All placeholders resolved successfully.');
  });

  it('formats result with missing keys', () => {
    const output = formatPlaceholderResult({ resolved: {}, missing: ['FOO', 'BAR'], replaced: 0 });
    expect(output).toContain('Unresolved placeholders: FOO, BAR');
  });
});
