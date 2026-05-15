import { EnvRecord } from '../parser/envParser';

export interface Defaults10Result {
  result: EnvRecord;
  applied: string[];
  skipped: string[];
}

/**
 * Apply defaults to an env record, only setting keys that are missing or empty.
 * Supports an optional `overwriteEmpty` flag to replace blank values.
 */
export function applyDefaults10(
  env: EnvRecord,
  defaults: EnvRecord,
  overwriteEmpty = false
): Defaults10Result {
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

export function getMissingDefaults10(
  env: EnvRecord,
  defaults: EnvRecord
): string[] {
  return Object.keys(defaults).filter(
    (key) => env[key] === undefined || env[key] === ''
  );
}

export function formatDefaults10Result(res: Defaults10Result): string {
  const lines: string[] = [];
  if (res.applied.length > 0) {
    lines.push(`Applied defaults for: ${res.applied.join(', ')}`);
  }
  if (res.skipped.length > 0) {
    lines.push(`Skipped (already set): ${res.skipped.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('No defaults applied.');
  }
  return lines.join('\n');
}
