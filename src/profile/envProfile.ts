export interface EnvProfile {
  name: string;
  description?: string;
  env: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStore {
  profiles: Record<string, EnvProfile>;
}

export function createProfile(
  name: string,
  env: Record<string, string>,
  description?: string
): EnvProfile {
  const now = new Date().toISOString();
  return { name, description, env, createdAt: now, updatedAt: now };
}

export function addProfile(
  store: ProfileStore,
  profile: EnvProfile
): ProfileStore {
  return {
    profiles: {
      ...store.profiles,
      [profile.name]: profile,
    },
  };
}

export function removeProfile(
  store: ProfileStore,
  name: string
): ProfileStore {
  const profiles = { ...store.profiles };
  delete profiles[name];
  return { profiles };
}

export function getProfile(
  store: ProfileStore,
  name: string
): EnvProfile | undefined {
  return store.profiles[name];
}

export function listProfiles(store: ProfileStore): EnvProfile[] {
  return Object.values(store.profiles);
}

export function applyProfile(
  base: Record<string, string>,
  profile: EnvProfile,
  override = true
): Record<string, string> {
  if (override) {
    return { ...base, ...profile.env };
  }
  const result = { ...base };
  for (const [key, value] of Object.entries(profile.env)) {
    if (!(key in result)) {
      result[key] = value;
    }
  }
  return result;
}

export function formatProfileResult(profiles: EnvProfile[]): string {
  if (profiles.length === 0) return 'No profiles found.';
  return profiles
    .map(
      (p) =>
        `[${p.name}]${p.description ? ` - ${p.description}` : ''} (${Object.keys(p.env).length} keys, updated ${p.updatedAt})`
    )
    .join('\n');
}
