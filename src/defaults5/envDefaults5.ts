import { parseEnv } from '../parser/envParser';

export interface Defaults5Result {
  env: Record<string, string>;
  applied: string[];
  skipped: string[];
}

/**
 * Apply defaults to an env record, only setting keys that are missing or empty.
 * Optionally override empty string values when `overrideEmpty` is true.
 */
export function applyDefaults5(
  env: Record<string, string>,
  defaults: Record<string, string>,
  overrideEmpty = false
): Defaults5Result {
  const result: Record<string, string> = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    const existing = result[key];
    if (existing === undefined || (overrideEmpty && existing.trim() === '')) {
      result[key] = value;
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { env: result, applied, skipped };
}

export function getMissingDefaults5(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter((k) => !(k in env));
}

export function formatDefaults5Result(result: Defaults5Result): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push(`Applied defaults for: ${result.applied.join(', ')}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already set): ${result.skipped.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('No defaults to apply.');
  }
  return lines.join('\n');
}
