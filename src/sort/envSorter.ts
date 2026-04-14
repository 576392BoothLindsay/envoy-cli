export type SortStrategy = 'alphabetical' | 'reverse' | 'length' | 'natural';

export interface SortOptions {
  strategy?: SortStrategy;
  groupByPrefix?: boolean;
  prefixDelimiter?: string;
}

export interface SortResult {
  original: Record<string, string>;
  sorted: Record<string, string>;
  changed: boolean;
}

export function sortEnv(
  env: Record<string, string>,
  options: SortOptions = {}
): SortResult {
  const { strategy = 'alphabetical', groupByPrefix = false, prefixDelimiter = '_' } = options;

  const keys = Object.keys(env);
  let sortedKeys: string[];

  if (groupByPrefix) {
    sortedKeys = sortByPrefix(keys, strategy, prefixDelimiter);
  } else {
    sortedKeys = sortKeys(keys, strategy);
  }

  const sorted: Record<string, string> = {};
  for (const key of sortedKeys) {
    sorted[key] = env[key];
  }

  const changed = keys.join(',') !== sortedKeys.join(',');

  return { original: env, sorted, changed };
}

function sortKeys(keys: string[], strategy: SortStrategy): string[] {
  switch (strategy) {
    case 'alphabetical':
      return [...keys].sort((a, b) => a.localeCompare(b));
    case 'reverse':
      return [...keys].sort((a, b) => b.localeCompare(a));
    case 'length':
      return [...keys].sort((a, b) => a.length - b.length || a.localeCompare(b));
    case 'natural':
      return [...keys].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
    default:
      return keys;
  }
}

function sortByPrefix(
  keys: string[],
  strategy: SortStrategy,
  delimiter: string
): string[] {
  const groups: Record<string, string[]> = {};
  const noPrefix: string[] = [];

  for (const key of keys) {
    const delimIndex = key.indexOf(delimiter);
    if (delimIndex > 0) {
      const prefix = key.substring(0, delimIndex);
      if (!groups[prefix]) groups[prefix] = [];
      groups[prefix].push(key);
    } else {
      noPrefix.push(key);
    }
  }

  const sortedPrefixes = sortKeys(Object.keys(groups), strategy);
  const result: string[] = sortKeys(noPrefix, strategy);

  for (const prefix of sortedPrefixes) {
    result.push(...sortKeys(groups[prefix], strategy));
  }

  return result;
}

export function formatSortResult(result: SortResult): string {
  if (!result.changed) {
    return 'Environment variables are already sorted.';
  }
  const count = Object.keys(result.sorted).length;
  return `Sorted ${count} environment variable${count !== 1 ? 's' : ''}.`;
}
