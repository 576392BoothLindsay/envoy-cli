import { parseEnv } from '../parser/envParser';

export interface Defaults3Result {
  applied: Record<string, string>;
  skipped: Record<string, string>;
  final: Record<string, string>;
}

/**
 * Apply defaults only when the key is missing or the value is empty.
 */
export function applyDefaults3(
  env: Record<string, string>,
  defaults: Record<string, string>,
  overwriteEmpty = true
): Defaults3Result {
  const applied: Record<string, string> = {};
  const skipped: Record<string, string> = {};
  const final: Record<string, string> = { ...env };

  for (const [key, defaultValue] of Object.entries(defaults)) {
    const existing = env[key];
    const isMissing = !(key in env);
    const isEmpty = existing !== undefined && existing.trim() === '';

    if (isMissing || (overwriteEmpty && isEmpty)) {
      final[key] = defaultValue;
      applied[key] = defaultValue;
    } else {
      skipped[key] = existing as string;
    }
  }

  return { applied, skipped, final };
}

/**
 * Returns keys from defaults that are absent or empty in env.
 */
export function getMissingDefaults3(
  env: Record<string, string>,
  defaults: Record<string, string>,
  includeEmpty = true
): string[] {
  return Object.keys(defaults).filter((key) => {
    const val = env[key];
    if (!(key in env)) return true;
    if (includeEmpty && val.trim() === '') return true;
    return false;
  });
}

export function formatDefaults3Result(result: Defaults3Result): string {
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
    lines.push(`Skipped ${skippedKeys.length} key(s) (already set):`);
    for (const key of skippedKeys) {
      lines.push(`  ~ ${key}=${result.skipped[key]}`);
    }
  }

  return lines.join('\n');
}
