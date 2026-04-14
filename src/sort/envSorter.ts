export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  order?: SortOrder;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export interface SortResult {
  original: Record<string, string>;
  sorted: Record<string, string>;
  order: SortOrder;
  keyCount: number;
}

/**
 * Sort env record keys alphabetically.
 */
export function sortKeys(
  env: Record<string, string>,
  order: SortOrder = 'asc'
): string[] {
  const keys = Object.keys(env);
  return keys.sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
}

/**
 * Group and sort keys by their prefix (e.g. DB_, APP_).
 */
export function sortByPrefix(
  env: Record<string, string>,
  delimiter = '_',
  order: SortOrder = 'asc'
): string[] {
  const keys = Object.keys(env);

  const grouped: Record<string, string[]> = {};
  const noPrefix: string[] = [];

  for (const key of keys) {
    const idx = key.indexOf(delimiter);
    if (idx > 0) {
      const prefix = key.substring(0, idx);
      if (!grouped[prefix]) grouped[prefix] = [];
      grouped[prefix].push(key);
    } else {
      noPrefix.push(key);
    }
  }

  const sortedPrefixes = Object.keys(grouped).sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );

  const result: string[] = [];
  for (const prefix of sortedPrefixes) {
    const sorted = grouped[prefix].sort((a, b) =>
      order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
    );
    result.push(...sorted);
  }

  noPrefix.sort((a, b) =>
    order === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  );
  result.push(...noPrefix);

  return result;
}

/**
 * Sort an env record and return a new ordered record.
 */
export function sortEnv(
  env: Record<string, string>,
  options: SortOptions = {}
): SortResult {
  const { order = 'asc', groupByPrefix = false, prefixDelimiter = '_' } = options;

  const sortedKeys = groupByPrefix
    ? sortByPrefix(env, prefixDelimiter, order)
    : sortKeys(env, order);

  const sorted: Record<string, string> = {};
  for (const key of sortedKeys) {
    sorted[key] = env[key];
  }

  return {
    original: env,
    sorted,
    order,
    keyCount: sortedKeys.length,
  };
}

/**
 * Format a sort result as a human-readable string.
 */
export function formatSortResult(result: SortResult): string {
  const lines: string[] = [
    `Sorted ${result.keyCount} key(s) in ${result.order}ending order:`,
    '',
  ];
  for (const [key, value] of Object.entries(result.sorted)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
