export interface DefaultsResult {
  applied: Record<string, string>;
  skipped: Record<string, string>;
  merged: Record<string, string>;
}

/**
 * Apply default values to an env record.
 * Only sets a key if it is missing or empty in the target.
 */
export function applyDefaults(
  target: Record<string, string>,
  defaults: Record<string, string>,
  overwriteEmpty = true
): DefaultsResult {
  const applied: Record<string, string> = {};
  const skipped: Record<string, string> = {};
  const merged: Record<string, string> = { ...target };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = target[key];
    const isMissing = !(key in target);
    const isEmpty = overwriteEmpty && existing === "";

    if (isMissing || isEmpty) {
      merged[key] = value;
      applied[key] = value;
    } else {
      skipped[key] = existing;
    }
  }

  return { applied, skipped, merged };
}

/**
 * Extract keys that have no value (empty string or missing) from an env record.
 */
export function getMissingDefaults(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter(
    (key) => !(key in env) || env[key] === ""
  );
}

/**
 * Format the result of applying defaults for CLI output.
 */
export function formatDefaultsResult(result: DefaultsResult): string {
  const lines: string[] = [];
  const appliedKeys = Object.keys(result.applied);
  const skippedKeys = Object.keys(result.skipped);

  if (appliedKeys.length === 0 && skippedKeys.length === 0) {
    return "No defaults to apply.";
  }

  if (appliedKeys.length > 0) {
    lines.push(`Applied defaults (${appliedKeys.length}):`);
    for (const key of appliedKeys) {
      lines.push(`  + ${key}=${result.applied[key]}`);
    }
  }

  if (skippedKeys.length > 0) {
    lines.push(`Skipped (already set) (${skippedKeys.length}):`);
    for (const key of skippedKeys) {
      lines.push(`  ~ ${key}`);
    }
  }

  return lines.join("\n");
}
