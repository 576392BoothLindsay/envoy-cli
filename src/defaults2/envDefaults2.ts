import { EnvRecord } from '../parser/envParser';

export interface Defaults2Options {
  overwrite?: boolean;
  prefix?: string;
}

export interface Defaults2Result {
  original: EnvRecord;
  result: EnvRecord;
  applied: string[];
  skipped: string[];
}

/**
 * Apply a defaults map to an env record.
 * By default, only fills in keys that are missing or empty.
 */
export function applyDefaults2(
  env: EnvRecord,
  defaults: EnvRecord,
  options: Defaults2Options = {}
): Defaults2Result {
  const { overwrite = false, prefix } = options;
  const result: EnvRecord = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    const targetKey = prefix ? `${prefix}${key}` : key;
    const existing = result[targetKey];
    if (overwrite || existing === undefined || existing === '') {
      result[targetKey] = value;
      applied.push(targetKey);
    } else {
      skipped.push(targetKey);
    }
  }

  return { original: env, result, applied, skipped };
}

/**
 * Return only the keys from defaults that are missing in env.
 */
export function getMissingDefaults2(env: EnvRecord, defaults: EnvRecord): EnvRecord {
  const missing: EnvRecord = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (!(key in env) || env[key] === '') {
      missing[key] = value;
    }
  }
  return missing;
}

export function formatDefaults2Result(result: Defaults2Result): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push(`Applied defaults for: ${result.applied.join(', ')}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already set): ${result.skipped.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('No defaults applied.');
  }
  return lines.join('\n');
}
