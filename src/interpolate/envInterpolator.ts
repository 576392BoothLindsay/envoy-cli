/**
 * envInterpolator.ts
 * Supports variable interpolation within .env files.
 * e.g. BASE_URL=https://${HOST}:${PORT}
 */

export type EnvRecord = Record<string, string>;

/**
 * Interpolates ${VAR} references within values using the provided env record.
 * References that cannot be resolved are left as-is.
 */
export function interpolateValue(value: string, env: EnvRecord): string {
  return value.replace(/\$\{([^}]+)\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(env, key) ? env[key] : match;
  });
}

/**
 * Interpolates all values in an env record.
 * Performs a single pass — forward references may not resolve.
 */
export function interpolateEnv(env: EnvRecord): EnvRecord {
  const result: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = interpolateValue(value, env);
  }
  return result;
}

/**
 * Returns the list of variable names referenced inside a value string.
 */
export function getReferencedKeys(value: string): string[] {
  const keys: string[] = [];
  const regex = /\$\{([^}]+)\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

/**
 * Returns keys whose values contain unresolved references after interpolation.
 */
export function getUnresolvedKeys(env: EnvRecord): string[] {
  const interpolated = interpolateEnv(env);
  return Object.entries(interpolated)
    .filter(([, value]) => /\$\{[^}]+\}/.test(value))
    .map(([key]) => key);
}
