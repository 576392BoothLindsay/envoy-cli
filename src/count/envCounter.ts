export interface CountResult {
  total: number;
  withValues: number;
  empty: number;
  byPrefix: Record<string, number>;
}

export function countKeys(env: Record<string, string>): CountResult {
  const keys = Object.keys(env);
  const total = keys.length;
  const withValues = keys.filter((k) => env[k] !== '').length;
  const empty = total - withValues;
  const byPrefix: Record<string, number> = {};

  for (const key of keys) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;
    }
  }

  return { total, withValues, empty, byPrefix };
}

export function formatCountResult(result: CountResult): string {
  const lines: string[] = [
    `Total keys   : ${result.total}`,
    `With values  : ${result.withValues}`,
    `Empty values : ${result.empty}`,
  ];

  const prefixes = Object.entries(result.byPrefix);
  if (prefixes.length > 0) {
    lines.push('');
    lines.push('By prefix:');
    for (const [prefix, count] of prefixes.sort((a, b) => b[1] - a[1])) {
      lines.push(`  ${prefix}_* : ${count}`);
    }
  }

  return lines.join('\n');
}
