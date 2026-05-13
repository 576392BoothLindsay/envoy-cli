export type Defaults9Record = Record<string, string>;

export interface Defaults9Result {
  env: Record<string, string>;
  applied: Record<string, string>;
  skipped: string[];
}

/**
 * Apply defaults only for missing or empty keys.
 * Existing non-empty values are preserved.
 */
export function applyDefaults9(
  env: Record<string, string>,
  defaults: Defaults9Record
): Defaults9Result {
  const result: Record<string, string> = { ...env };
  const applied: Record<string, string> = {};
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    const existing = env[key];
    if (existing === undefined || existing === "") {
      result[key] = value;
      applied[key] = value;
    } else {
      skipped.push(key);
    }
  }

  return { env: result, applied, skipped };
}

export function getMissingDefaults9(
  env: Record<string, string>,
  defaults: Defaults9Record
): string[] {
  return Object.keys(defaults).filter(
    (key) => env[key] === undefined || env[key] === ""
  );
}

export function formatDefaults9Result(result: Defaults9Result): string {
  const lines: string[] = [];

  const appliedKeys = Object.keys(result.applied);
  if (appliedKeys.length > 0) {
    lines.push(`Applied ${appliedKeys.length} default(s):`);
    for (const key of appliedKeys) {
      lines.push(`  + ${key}=${result.applied[key]}`);
    }
  } else {
    lines.push("No defaults applied.");
  }

  if (result.skipped.length > 0) {
    lines.push(`Skipped ${result.skipped.length} key(s) (already set):`);
    for (const key of result.skipped) {
      lines.push(`  ~ ${key}`);
    }
  }

  return lines.join("\n");
}
