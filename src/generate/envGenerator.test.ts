import {
  generateValue,
  generateEnv,
  generateMissingKeys,
  formatGenerateResult,
} from './envGenerator';

describe('generateValue', () => {
  it('returns a placeholder by default', () => {
    const val = generateValue('DATABASE_URL');
    expect(val).toBe('CHANGE_ME_DATABASE_URL');
  });

  it('returns a random hex string for random strategy', () => {
    const val = generateValue('SECRET', { strategy: 'random', length: 16 });
    expect(val).toMatch(/^[0-9a-f]{16}$/);
  });

  it('returns a UUID for uuid strategy', () => {
    const val = generateValue('API_KEY', { strategy: 'uuid' });
    expect(val).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('returns an empty string for empty strategy', () => {
    const val = generateValue('OPTIONAL_KEY', { strategy: 'empty' });
    expect(val).toBe('');
  });

  it('applies prefix to generated value', () => {
    const val = generateValue('TOKEN', { strategy: 'random', length: 8, prefix: 'tok_' });
    expect(val).toMatch(/^tok_[0-9a-f]{8}$/);
  });
});

describe('generate  it('generates values for all provided keys', () => {
    _A', 'KEY_B'], { strategy: 'placeholder' });
    expect(result.count).toBe(2);
    expect(result.generated).toHaveProperty('KEY_A', 'CHANGE_ME_KEY_A');
    expect(result.generated).toHaveProperty('KEY_B', 'CHANGE_ME_KEY_B');
    expect(result.strategy).toBe('placeholder');
  });

  it('returns empty result for empty key list', () => {
    const result = generateEnv([]);
    expect(result.count).toBe(0);
    expect(result.generated).toEqual({});
  });
});

describe('generateMissingKeys', () => {
  it('only generates values for keys not in existing env', () => {
    const existing = { EXISTING_KEY: 'already_set' };
    const result = generateMissingKeys(
      ['EXISTING_KEY', 'NEW_KEY'],
      existing,
      { strategy: 'placeholder' }
    );
    expect(result.count).toBe(1);
    expect(result.generated).not.toHaveProperty('EXISTING_KEY');
    expect(result.generated).toHaveProperty('NEW_KEY', 'CHANGE_ME_NEW_KEY');
  });

  it('returns empty result when all keys already exist', () => {
    const existing = { A: '1', B: '2' };
    const result = generateMissingKeys(['A', 'B'], existing);
    expect(result.count).toBe(0);
  });
});

describe('formatGenerateResult', () => {
  it('formats the result into a readable string', () => {
    const result = { generated: { FOO: 'bar' }, count: 1, strategy: 'placeholder' as const };
    const output = formatGenerateResult(result);
    expect(output).toContain('Generated 1 value(s) using strategy: placeholder');
    expect(output).toContain('FOO=bar');
  });
});
