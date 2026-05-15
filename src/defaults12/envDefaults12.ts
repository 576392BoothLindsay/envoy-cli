export interface Defaults12Result {
  env: Record<string, string>;
  applied: string[];
  skipped: string[];
}

export function applyDefaults12(
  env: Record<string, string>,
  defaults: Record<string, string>,
  overwrite = false
): Defaults12Result {
  const result: Record<string, string> = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    if (overwrite || !(key in result)) {
      result[key] = value;
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { env: result, applied, skipped };
}

export function getMissingDefaults12(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter((key) => !(key in env));
}

export function formatDefaults12Result(result: Defaults12Result): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push(`Applied defaults (${result.applied.length}): ${result.applied.join(', ')}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already set) (${result.skipped.length}): ${result.skipped.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('No defaults to apply.');
  }
  return lines.join('\n');
}
