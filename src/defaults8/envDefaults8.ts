import { EnvRecord } from '../parser/envParser';

export interface Defaults8Result {
  result: EnvRecord;
  applied: string[];
  skipped: string[];
}

/**
 * Apply defaults only to keys that are missing or empty.
 * If overwriteEmpty is true, blank values are also replaced.
 */
export function applyDefaults8(
  env: EnvRecord,
  defaults: EnvRecord,
  overwriteEmpty = false
): Defaults8Result {
  const result: EnvRecord = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    const existing = result[key];
    const isMissing = existing === undefined;
    const isEmpty = existing === '';

    if (isMissing || (overwriteEmpty && isEmpty)) {
      result[key] = value;
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { result, applied, skipped };
}

export function getMissingDefaults8(
  env: EnvRecord,
  defaults: EnvRecord
): string[] {
  return Object.keys(defaults).filter((k) => env[k] === undefined);
}

export function formatDefaults8Result(res: Defaults8Result): string {
  const lines: string[] = [];
  if (res.applied.length > 0) {
    lines.push(`Applied defaults (${res.applied.length}): ${res.applied.join(', ')}`);
  }
  if (res.skipped.length > 0) {
    lines.push(`Skipped (${res.skipped.length}): ${res.skipped.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('No defaults applied.');
  }
  return lines.join('\n');
}
