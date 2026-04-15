export type DedupeStrategy = 'keep-first' | 'keep-last' | 'remove-all';

export interface DedupeResult {
  env: Record<string, string>;
  removed: string[];
}

/**
 * Finds all values that appear more than once, mapping value -> keys.
 */
export function findDuplicateValues(
  env: Record<string, string>
): Map<string, string[]> {
  const valueMap = new Map<string, string[]>();

  for (const [key, value] of Object.entries(env)) {
    const existing = valueMap.get(value) ?? [];
    valueMap.set(value, [...existing, key]);
  }

  for (const [value, keys] of valueMap.entries()) {
    if (keys.length < 2) {
      valueMap.delete(value);
    }
  }

  return valueMap;
}

/**
 * Removes duplicate values from an env record according to the given strategy.
 */
export function dedupeEnv(
  env: Record<string, string>,
  strategy: DedupeStrategy = 'keep-first'
): DedupeResult {
  const duplicates = findDuplicateValues(env);

  if (duplicates.size === 0) {
    return { env: { ...env }, removed: [] };
  }

  const keysToRemove = new Set<string>();

  for (const keys of duplicates.values()) {
    if (strategy === 'keep-first') {
      // Remove all but the first key
      keys.slice(1).forEach((k) => keysToRemove.add(k));
    } else if (strategy === 'keep-last') {
      // Remove all but the last key
      keys.slice(0, -1).forEach((k) => keysToRemove.add(k));
    } else if (strategy === 'remove-all') {
      keys.forEach((k) => keysToRemove.add(k));
    }
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!keysToRemove.has(key)) {
      result[key] = value;
    }
  }

  return { env: result, removed: Array.from(keysToRemove) };
}

/**
 * Formats a DedupeResult into a human-readable string.
 */
export function formatDedupeResult(result: DedupeResult): string {
  if (result.removed.length === 0) {
    return 'No duplicate values found.';
  }

  const lines: string[] = [
    `Removed ${result.removed.length} duplicate key${
      result.removed.length === 1 ? '' : 's'
    }:`,
  ];

  for (const key of result.removed) {
    lines.push(`  - ${key}`);
  }

  return lines.join('\n');
}
