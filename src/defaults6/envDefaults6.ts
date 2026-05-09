export interface Defaults6Result {
  env: Record<string, string>;
  applied: string[];
  skipped: string[];
}

/**
 * Apply defaults to an env record, only setting keys that are missing or empty.
 * @param env - The source env record
 * @param defaults - Key/value pairs to use as defaults
 * @param overwriteEmpty - If true, overwrite keys whose current value is an empty string
 */
export function applyDefaults6(
  env: Record<string, string>,
  defaults: Record<string, string>,
  overwriteEmpty = false
): Defaults6Result {
  const result: Record<string, string> = { ...env };
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

  return { env: result, applied, skipped };
}

export function getMissingDefaults6(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter((key) => !(key in env));
}

export function formatDefaults6Result(result: Defaults6Result): string {
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
