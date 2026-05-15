export interface Defaults11Result {
  env: Record<string, string>;
  applied: string[];
  skipped: string[];
}

/**
 * Apply defaults only when the key is missing or has an empty value.
 * @param env   Source environment record
 * @param defaults  Map of key → default value
 * @param overwriteEmpty  When true, replace empty-string values with the default
 */
export function applyDefaults11(
  env: Record<string, string>,
  defaults: Record<string, string>,
  overwriteEmpty = false
): Defaults11Result {
  const result: Record<string, string> = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    const existing = result[key];
    const isMissing = existing === undefined;
    const isEmpty = existing === "";

    if (isMissing || (overwriteEmpty && isEmpty)) {
      result[key] = value;
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { env: result, applied, skipped };
}

export function getMissingDefaults11(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter((key) => !(key in env));
}

export function formatDefaults11Result(result: Defaults11Result): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push(`Applied defaults for: ${result.applied.join(", ")}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already set): ${result.skipped.join(", ")}`);
  }
  if (lines.length === 0) {
    lines.push("No defaults to apply.");
  }
  return lines.join("\n");
}
