import {
  blankKeys,
  blankByPattern,
  getBlankKeys,
  formatBlankResult,
  buildBlankResult,
} from './envBlank';

const sampleEnv: Record<string, string> = {
  API_KEY: 'secret123',
  DB_PASSWORD: 'hunter2',
  APP_NAME: 'myapp',
  DEBUG: 'true',
  EMPTY_KEY: '',
};

describe('blankKeys', () => {
  it('blanks specified keys', () => {
    const result = blankKeys(sampleEnv, ['API_KEY', 'DB_PASSWORD']);
    expect(result['API_KEY']).toBe('');
    expect(result['DB_PASSWORD']).toBe('');
    expect(result['APP_NAME']).toBe('myapp');
  });

  it('ignores keys not in env', () => {
    const result = blankKeys(sampleEnv, ['NONEXISTENT']);
    expect(result).not.toHaveProperty('NONEXISTENT');
    expect(result['API_KEY']).toBe('secret123');
  });

  it('does not mutate original', () => {
    blankKeys(sampleEnv, ['API_KEY']);
    expect(sampleEnv['API_KEY']).toBe('secret123');
  });
});

describe('blankByPattern', () => {
  it('blanks keys matching pattern', () => {
    const result = blankByPattern(sampleEnv, '.*_KEY$');
    expect(result['API_KEY']).toBe('');
    expect(result['DB_PASSWORD']).toBe('hunter2');
  });

  it('blanks multiple matching keys', () => {
    const result = blankByPattern(sampleEnv, '^(API_KEY|DEBUG)$');
    expect(result['API_KEY']).toBe('');
    expect(result['DEBUG']).toBe('');
    expect(result['APP_NAME']).toBe('myapp');
  });
});

describe('getBlankKeys', () => {
  it('returns keys with empty string values', () => {
    const keys = getBlankKeys(sampleEnv);
    expect(keys).toEqual(['EMPTY_KEY']);
  });

  it('returns empty array when no blank keys', () => {
    const env = { A: '1', B: '2' };
    expect(getBlankKeys(env)).toEqual([]);
  });
});

describe('formatBlankResult', () => {
  it('formats result with blanked keys', () => {
    const result = { blanked: {}, keys: ['API_KEY', 'DB_PASSWORD'], count: 2 };
    const output = formatBlankResult(result);
    expect(output).toContain('Blanked 2 key(s)');
    expect(output).toContain('API_KEY=');
  });

  it('handles zero blanked keys', () => {
    const result = { blanked: {}, keys: [], count: 0 };
    expect(formatBlankResult(result)).toBe('No keys were blanked.');
  });
});

describe('buildBlankResult', () => {
  it('identifies newly blanked keys', () => {
    const blanked = { ...sampleEnv, API_KEY: '' };
    const result = buildBlankResult(sampleEnv, blanked);
    expect(result.count).toBe(1);
    expect(result.keys).toContain('API_KEY');
  });

  it('does not count already-blank keys', () => {
    const blanked = { ...sampleEnv, EMPTY_KEY: '' };
    const result = buildBlankResult(sampleEnv, blanked);
    expect(result.keys).not.toContain('EMPTY_KEY');
  });
});
