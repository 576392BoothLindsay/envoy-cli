export type FilterMode = 'include' | 'exclude';

export interface FilterOptions {
  keys?: string[];
  pattern?: string | RegExp;
  mode: FilterMode;
}

export interface FilterResult {
  filtered: Record<string, string>;
  matched: string[];
  unmatched: string[];
}

export function filterEnv(
  env: Record<string, string>,
  options: FilterOptions
): FilterResult {
  const { keys = [], pattern, mode } = options;
  const allKeys = Object.keys(env);

  const matched = allKeys.filter((key) => {
    const matchesKey = keys.length > 0 && keys.includes(key);
    const matchesPattern = pattern
      ? typeof pattern === 'string'
        ? key.includes(pattern)
        : pattern.test(key)
      : false;
    return matchesKey || matchesPattern;
  });

  const unmatched = allKeys.filter((k) => !matched.includes(k));

  const selectedKeys = mode === 'include' ? matched : unmatched;

  const filtered = selectedKeys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = env[key];
    return acc;
  }, {});

  return { filtered, matched, unmatched };
}

export function filterByPrefix(
  env: Record<string, string>,
  prefix: string,
  strip = false
): Record<string, string> {
  return Object.entries(env).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (key.startsWith(prefix)) {
        const newKey = strip ? key.slice(prefix.length) : key;
        acc[newKey] = value;
      }
      return acc;
    },
    {}
  );
}

export function formatFilterResult(result: FilterResult): string {
  const lines: string[] = [];
  lines.push(`Matched keys (${result.matched.length}): ${result.matched.join(', ') || 'none'}`);
  lines.push(`Filtered entries: ${Object.keys(result.filtered).length}`);
  return lines.join('\n');
}
