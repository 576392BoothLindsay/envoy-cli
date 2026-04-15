/**
 * envDedupe.ts
 * Detects and removes duplicate values in .env records.
 */

export interface DuplicateEntry {
  value: string;
  keys: string[];
}

export interface DedupeResult {
  original: Record<string, string>;
  deduped: Record<string, string>;
  duplicates: DuplicateEntry[];
  removedKeys: string[];
}

/**
 * Finds keys that share the same value.
 */
export function findDuplicateValues(
  env: Record<string, string>
): DuplicateEntry[] {
  const valueMap = new Map<string, string[]>();

  for (const [key, value] of Object.entries(env)) {
    if (!valueMap.has(value)) {
      valueMap.set(value, []);
    }
    valueMap.get(value)!.push(key);
  }

  const duplicates: DuplicateEntry[] = [];
  for (const [value, keys] of valueMap.entries()) {
    if (keys.length > 1) {
      duplicates.push({ value, keys });
    }
  }

  return duplicates;
}

/**
 * Removes duplicate-value keys, keeping the first occurrence (alphabetically).
 */
export function dedupeEnv(
  env: Record<string, string>
): DedupeResult {
  const duplicates = findDuplicateValues(env);
  const keysToRemove = new Set<string>();

  for (const { keys } of duplicates) {
    const sorted = [...keys].sort();
    // Keep the first key, remove the rest
    for (const key of sorted.slice(1)) {
      keysToRemove.add(key);
    }
  }

  const deduped: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!keysToRemove.has(key)) {
      deduped[key] = value;
    }
  }

  return {
    original: env,
    deduped,
    duplicates,
    removedKeys: [...keysToRemove],
  };
}

/**
 * Formats a DedupeResult into a human-readable string.
 */
export function formatDedupeResult(result: DedupeResult): string {
  if (result.duplicates.length === 0) {
    return 'No duplicate values found.';
  }

  const lines: string[] = ['Duplicate values detected:'];
  for (const { value, keys } of result.duplicates) {
    const display = value.length > 40 ? value.slice(0, 37) + '...' : value;
    lines.push(`  "${display}" shared by: ${keys.join(', ')}`);
  }

  if (result.removedKeys.length > 0) {
    lines.push(`Removed keys: ${result.removedKeys.join(', ')}`);
  }

  return lines.join('\n');
}
