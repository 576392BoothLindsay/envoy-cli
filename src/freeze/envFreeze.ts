export interface FreezeResult {
  frozen: Record<string, string>;
  skipped: string[];
  frozenKeys: string[];
}

export function freezeKeys(
  env: Record<string, string>,
  keys: string[]
): FreezeResult {
  const frozen: Record<string, string> = { ...env };
  const frozenKeys: string[] = [];
  const skipped: string[] = [];

  for (const key of keys) {
    if (key in env) {
      frozenKeys.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { frozen, skipped, frozenKeys };
}

export function applyFreeze(
  base: Record<string, string>,
  incoming: Record<string, string>,
  frozenKeys: string[]
): Record<string, string> {
  const result: Record<string, string> = { ...incoming };
  for (const key of frozenKeys) {
    if (key in base) {
      result[key] = base[key];
    }
  }
  return result;
}

export function formatFreezeResult(result: FreezeResult): string {
  const lines: string[] = [];
  if (result.frozenKeys.length > 0) {
    lines.push(`Frozen keys (${result.frozenKeys.length}):`);
    result.frozenKeys.forEach(k => lines.push(`  + ${k}`));
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (not found) (${result.skipped.length}):`);
    result.skipped.forEach(k => lines.push(`  - ${k}`));
  }
  if (lines.length === 0) return 'No keys frozen.';
  return lines.join('\n');
}
