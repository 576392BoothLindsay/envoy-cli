import {
  createProfile,
  addProfile,
  removeProfile,
  getProfile,
  listProfiles,
  applyProfile,
  formatProfileResult,
  ProfileStore,
} from './envProfile';

const emptyStore: ProfileStore = { profiles: {} };

describe('createProfile', () => {
  it('creates a profile with required fields', () => {
    const profile = createProfile('dev', { PORT: '3000' });
    expect(profile.name).toBe('dev');
    expect(profile.env).toEqual({ PORT: '3000' });
    expect(profile.createdAt).toBeDefined();
    expect(profile.updatedAt).toBeDefined();
  });

  it('includes optional description', () => {
    const profile = createProfile('prod', {}, 'Production');
    expect(profile.description).toBe('Production');
  });
});

describe('addProfile / removeProfile', () => {
  it('adds a profile to the store', () => {
    const profile = createProfile('dev', { PORT: '3000' });
    const store = addProfile(emptyStore, profile);
    expect(store.profiles['dev']).toEqual(profile);
  });

  it('removes a profile from the store', () => {
    const profile = createProfile('dev', { PORT: '3000' });
    const store = addProfile(emptyStore, profile);
    const updated = removeProfile(store, 'dev');
    expect(updated.profiles['dev']).toBeUndefined();
  });

  it('does not mutate the original store', () => {
    const profile = createProfile('dev', {});
    addProfile(emptyStore, profile);
    expect(emptyStore.profiles).toEqual({});
  });
});

describe('getProfile', () => {
  it('returns the profile by name', () => {
    const profile = createProfile('staging', { API: 'url' });
    const store = addProfile(emptyStore, profile);
    expect(getProfile(store, 'staging')).toEqual(profile);
  });

  it('returns undefined for missing profile', () => {
    expect(getProfile(emptyStore, 'missing')).toBeUndefined();
  });
});

describe('listProfiles', () => {
  it('returns all profiles as array', () => {
    const p1 = createProfile('dev', {});
    const p2 = createProfile('prod', {});
    const store = addProfile(addProfile(emptyStore, p1), p2);
    expect(listProfiles(store)).toHaveLength(2);
  });
});

describe('applyProfile', () => {
  it('merges profile env over base (override=true)', () => {
    const base = { PORT: '3000', HOST: 'localhost' };
    const profile = createProfile('dev', { PORT: '4000', DEBUG: 'true' });
    const result = applyProfile(base, profile, true);
    expect(result.PORT).toBe('4000');
    expect(result.DEBUG).toBe('true');
    expect(result.HOST).toBe('localhost');
  });

  it('does not override existing keys when override=false', () => {
    const base = { PORT: '3000' };
    const profile = createProfile('dev', { PORT: '9999', NEW: 'val' });
    const result = applyProfile(base, profile, false);
    expect(result.PORT).toBe('3000');
    expect(result.NEW).toBe('val');
  });
});

describe('formatProfileResult', () => {
  it('returns message when no profiles', () => {
    expect(formatProfileResult([])).toBe('No profiles found.');
  });

  it('formats profiles with key count', () => {
    const p = createProfile('dev', { A: '1', B: '2' }, 'Dev env');
    const output = formatProfileResult([p]);
    expect(output).toContain('[dev]');
    expect(output).toContain('Dev env');
    expect(output).toContain('2 keys');
  });
});
