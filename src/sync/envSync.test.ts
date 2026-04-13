import { syncEnv, mergeEnvs } from './envSync';
import { EnvMap } from '../parser/envParser';

describe('syncEnv', () => {
  const source: EnvMap = {
    APP_NAME: 'envoy',
    API_KEY: 'new-secret',
    NEW_VAR: 'hello',
  };

  const target: EnvMap = {
    APP_NAME: 'envoy',
    API_KEY: 'old-secret',
    EXTRA_VAR: 'keep-me',
  };

  it('adds missing keys by default', () => {
    const { synced, added } = syncEnv(source, target);
    expect(synced['NEW_VAR']).toBe('hello');
    expect(added).toContain('NEW_VAR');
  });

  it('updates changed keys by default', () => {
    const { synced, updated } = syncEnv(source, target);
    expect(synced['API_KEY']).toBe('new-secret');
    expect(updated).toContain('API_KEY');
  });

  it('does not remove extra keys by default', () => {
    const { synced, removed, skipped } = syncEnv(source, target);
    expect(synced['EXTRA_VAR']).toBe('keep-me');
    expect(removed).toHaveLength(0);
    expect(skipped).toContain('EXTRA_VAR');
  });

  it('removes extra keys when removeExtra is true', () => {
    const { synced, removed } = syncEnv(source, target, { removeExtra: true });
    expect(synced['EXTRA_VAR']).toBeUndefined();
    expect(removed).toContain('EXTRA_VAR');
  });

  it('skips missing keys when addMissing is false', () => {
    const { synced, skipped } = syncEnv(source, target, { addMissing: false });
    expect(synced['NEW_VAR']).toBeUndefined();
    expect(skipped).toContain('NEW_VAR');
  });

  it('skips changed keys when overwrite is false', () => {
    const { synced, skipped } = syncEnv(source, target, { overwrite: false });
    expect(synced['API_KEY']).toBe('old-secret');
    expect(skipped).toContain('API_KEY');
  });

  it('does not mutate the original target', () => {
    syncEnv(source, target);
    expect(target['NEW_VAR']).toBeUndefined();
  });
});

describe('mergeEnvs', () => {
  it('merges multiple env maps with later values taking precedence', () => {
    const base: EnvMap = { A: '1', B: '2' };
    const override: EnvMap = { B: '99', C: '3' };
    const result = mergeEnvs(base, override);
    expect(result).toEqual({ A: '1', B: '99', C: '3' });
  });

  it('returns empty object when no maps provided', () => {
    expect(mergeEnvs()).toEqual({});
  });
});
