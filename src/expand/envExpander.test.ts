import { expandValue, expandEnv, formatExpandResult } from './envExpander';

describe('expandValue', () => {
  it('expands ${VAR} syntax', () => {
    const env = { HOME: '/home/user', PATH: '${HOME}/bin' };
    expect(expandValue('${HOME}/bin', env)).toBe('/home/user/bin');
  });

  it('expands $VAR syntax', () => {
    const env = { NAME: 'world', MSG: 'hello $NAME' };
    expect(expandValue('hello $NAME', env)).toBe('hello world');
  });

  it('leaves unresolvable references unchanged', () => {
    const env = {};
    expect(expandValue('${MISSING}', env)).toBe('${MISSING}');
  });

  it('handles circular references gracefully', () => {
    const env = { A: '${B}', B: '${A}' };
    const result = expandValue('${A}', env);
    // Should not throw and should return something stable
    expect(typeof result).toBe('string');
  });

  it('expands nested references', () => {
    const env = { BASE: '/app', DIR: '${BASE}/data', FILE: '${DIR}/file.txt' };
    expect(expandValue('${FILE}', env)).toBe('/app/data/file.txt');
  });

  it('returns value unchanged when no references present', () => {
    expect(expandValue('plain_value', {})).toBe('plain_value');
  });
});

describe('expandEnv', () => {
  it('expands all variable references in the record', () => {
    const env = { HOST: 'localhost', PORT: '5432', URL: 'postgres://${HOST}:${PORT}/db' };
    const { expanded } = expandEnv(env);
    expect(expanded.URL).toBe('postgres://localhost:5432/db');
  });

  it('tracks which keys were expanded', () => {
    const env = { A: 'hello', B: '${A} world' };
    const { expandedKeys, skippedKeys } = expandEnv(env);
    expect(expandedKeys).toContain('B');
    expect(skippedKeys).toContain('A');
  });

  it('returns unchanged keys in skippedKeys', () => {
    const env = { PLAIN: 'no_refs' };
    const { skippedKeys } = expandEnv(env);
    expect(skippedKeys).toContain('PLAIN');
  });

  it('handles empty env', () => {
    const { expanded, expandedKeys, skippedKeys } = expandEnv({});
    expect(expanded).toEqual({});
    expect(expandedKeys).toHaveLength(0);
    expect(skippedKeys).toHaveLength(0);
  });
});

describe('formatExpandResult', () => {
  it('reports expanded keys', () => {
    const result = { expanded: {}, expandedKeys: ['URL', 'DSN'], skippedKeys: ['HOST'] };
    const output = formatExpandResult(result);
    expect(output).toContain('Expanded 2 key(s)');
    expect(output).toContain('URL');
  });

  it('reports no expansion when nothing changed', () => {
    const result = { expanded: {}, expandedKeys: [], skippedKeys: ['A'] };
    expect(formatExpandResult(result)).toContain('No variables were expanded.');
  });
});
