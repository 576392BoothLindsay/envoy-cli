import { promoteEnv, formatPromoteResult } from './envPromote';
import { EnvRecord } from '../parser/envParser';

describe('promoteEnv', () => {
  const source: EnvRecord = { API_URL: 'https://prod.example.com', SECRET: 'prod-secret', NEW_KEY: 'new-value' };
  const target: EnvRecord = { API_URL: 'https://staging.example.com', SECRET: 'staging-secret', EXISTING: 'keep-me' };

  it('overwrites all source keys into target by default', () => {
    const { result, summary } = promoteEnv(source, target);
    expect(result['API_URL']).toBe('https://prod.example.com');
    expect(result['SECRET']).toBe('prod-secret');
    expect(result['NEW_KEY']).toBe('new-value');
    expect(result['EXISTING']).toBe('keep-me');
    expect(Object.keys(summary.promoted)).toHaveLength(3);
  });

  it('skips keys already present in target when strategy is skip', () => {
    const { result, summary } = promoteEnv(source, target, { strategy: 'skip' });
    expect(result['API_URL']).toBe('https://staging.example.com');
    expect(result['SECRET']).toBe('staging-secret');
    expect(result['NEW_KEY']).toBe('new-value');
    expect(summary.skipped).toContain('API_URL');
    expect(summary.skipped).toContain('SECRET');
    expect(Object.keys(summary.promoted)).toContain('NEW_KEY');
  });

  it('promotes only specified keys', () => {
    const { result, summary } = promoteEnv(source, target, { keys: ['API_URL'] });
    expect(result['API_URL']).toBe('https://prod.example.com');
    expect(result['SECRET']).toBe('staging-secret');
    expect(Object.keys(summary.promoted)).toEqual(['API_URL']);
  });

  it('excludes specified keys from promotion', () => {
    const { result, summary } = promoteEnv(source, target, { excludeKeys: ['SECRET'] });
    expect(result['SECRET']).toBe('staging-secret');
    expect(result['API_URL']).toBe('https://prod.example.com');
    expect(Object.keys(summary.promoted)).not.toContain('SECRET');
  });

  it('marks unchanged keys in merge strategy when values match', () => {
    const sameTarget = { ...target, API_URL: 'https://prod.example.com' };
    const { summary } = promoteEnv(source, sameTarget, { strategy: 'merge' });
    expect(summary.unchanged).toContain('API_URL');
    expect(Object.keys(summary.promoted)).not.toContain('API_URL');
  });

  it('ignores source keys not in source record', () => {
    const { summary } = promoteEnv(source, target, { keys: ['MISSING_KEY'] });
    expect(Object.keys(summary.promoted)).toHaveLength(0);
  });
});

describe('formatPromoteResult', () => {
  it('formats a full promote result', () => {
    const output = formatPromoteResult({
      promoted: { API_URL: { from: 'old', to: 'new' } },
      skipped: ['SECRET'],
      unchanged: ['DEBUG'],
    });
    expect(output).toContain('Promoted (1)');
    expect(output).toContain('API_URL');
    expect(output).toContain('Skipped (1): SECRET');
    expect(output).toContain('Unchanged (1): DEBUG');
  });

  it('shows (unset) for keys not previously in target', () => {
    const output = formatPromoteResult({
      promoted: { NEW_KEY: { from: undefined, to: 'value' } },
      skipped: [],
      unchanged: [],
    });
    expect(output).toContain('(unset)');
  });
});
