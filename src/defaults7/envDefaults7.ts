import { parseEnv } from '../parser/envParser';

export interface Defaults7Result {
  original: Record<string, string>;
  merged: Record<string, string>;
  applied: string[];
  skipped: string[];
}

/**
 * Apply defaults to an env record, optionally overriding existing keys.
 */
export function applyDefaults7(
  env: Record<string, string>,
  defaults: Record<string, string>,
  override = false
): Defaults7Result {
  const merged: Record<string, string> = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    if (override || !(key in env)) {
      merged[key] = value;
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { original: env, merged, applied, skipped };
}

/**
 * Return keys present in defaults but missing from env.
 */
export function getMissingDefaults7(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter((k) => !(k in env));
}

export function formatDefaults7Result(result: Defaults7Result): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push(`Applied defaults (${result.applied.length}): ${result.applied.join(', ')}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already set, ${result.skipped.length}): ${result.skipped.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('No defaults applied.');
  }
  return lines.join('\n');
}
