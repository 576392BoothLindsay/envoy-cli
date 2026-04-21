import { EnvRecord } from '../parser/envParser';

export interface DefaultsResult {
  applied: Record<string, string>;
  skipped: Record<string, string>;
  result: EnvRecord;
}

/**
 * Apply default values to an env record for any missing keys.
 */
export function applyDefaults(
  env: EnvRecord,
  defaults: EnvRecord,
  overwrite = false
): DefaultsResult {
  const applied: Record<string, string> = {};
  const skipped: Record<string, string> = {};
  const result: EnvRecord = { ...env };

  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in result) || overwrite) {
      if (key in result && overwrite) {
        skipped[key] = result[key];
      }
      result[key] = value;
      applied[key] = value;
    } else {
      skipped[key] = result[key];
    }
  }

  return { applied, skipped, result };
}

/**
 * Return keys from defaults that are missing in the env record.
 */
export function getMissingDefaults(
  env: EnvRecord,
  defaults: EnvRecord
): EnvRecord {
  const missing: EnvRecord = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in env)) {
      missing[key] = value;
    }
  }
  return missing;
}

/**
 * Format a DefaultsResult into a human-readable string.
 */
export function formatDefaultsResult(result: DefaultsResult): string {
  const lines: string[] = [];
  const appliedKeys = Object.keys(result.applied);
  const skippedKeys = Object.keys(result.skipped);

  if (appliedKeys.length === 0) {
    lines.push('No defaults applied.');
  } else {
    lines.push(`Applied ${appliedKeys.length} default(s):`);
    for (const key of appliedKeys) {
      lines.push(`  + ${key}=${result.applied[key]}`);
    }
  }

  if (skippedKeys.length > 0) {
    lines.push(`Skipped ${skippedKeys.length} existing key(s):`);
    for (const key of skippedKeys) {
      lines.push(`  ~ ${key}=${result.skipped[key]}`);
    }
  }

  return lines.join('\n');
}
