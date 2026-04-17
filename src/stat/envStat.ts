export interface EnvStat {
  total: number;
  empty: number;
  filled: number;
  redacted: number;
  prefixes: Record<string, number>;
  avgValueLength: number;
  longestKey: string;
  shortestKey: string;
}

export function statEnv(env: Record<string, string>): EnvStat {
  const keys = Object.keys(env);
  const total = keys.length;

  if (total === 0) {
    return { total: 0, empty: 0, filled: 0, redacted: 0, prefixes: {}, avgValueLength: 0, longestKey: '', shortestKey: '' };
  }

  let empty = 0;
  let redacted = 0;
  let totalValueLength = 0;
  const prefixes: Record<string, number> = {};

  for (const key of keys) {
    const value = env[key];
    if (value === '') empty++;
    if (value === '***' || value === '[REDACTED]') redacted++;
    totalValueLength += value.length;

    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
  }

  const sorted = [...keys].sort((a, b) => a.length - b.length);

  return {
    total,
    empty,
    filled: total - empty,
    redacted,
    prefixes,
    avgValueLength: Math.round(totalValueLength / total),
    longestKey: sorted[sorted.length - 1],
    shortestKey: sorted[0],
  };
}

export function formatStatResult(stat: EnvStat): string {
  const lines: string[] = [
    `Total keys    : ${stat.total}`,
    `Filled        : ${stat.filled}`,
    `Empty         : ${stat.empty}`,
    `Redacted      : ${stat.redacted}`,
    `Avg val length: ${stat.avgValueLength}`,
    `Longest key   : ${stat.longestKey}`,
    `Shortest key  : ${stat.shortestKey}`,
  ];

  const prefixEntries = Object.entries(stat.prefixes);
  if (prefixEntries.length > 0) {
    lines.push('Prefixes:');
    for (const [prefix, count] of prefixEntries) {
      lines.push(`  ${prefix}_* : ${count}`);
    }
  }

  return lines.join('\n');
}
