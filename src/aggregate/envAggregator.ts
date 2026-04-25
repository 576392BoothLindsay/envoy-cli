import { EnvRecord } from '../parser/envParser';

export interface AggregateStats {
  totalKeys: number;
  uniqueValues: number;
  emptyValues: number;
  numericValues: number;
  booleanValues: number;
  longestKey: string;
  longestValue: string;
  averageValueLength: number;
}

export interface AggregateResult {
  stats: AggregateStats;
  byPrefix: Record<string, number>;
  valueFrequency: Record<string, number>;
}

export function aggregateEnv(env: EnvRecord): AggregateResult {
  const keys = Object.keys(env);
  const values = Object.values(env);

  const uniqueValues = new Set(values).size;
  const emptyValues = values.filter((v) => v === '').length;
  const numericValues = values.filter((v) => v !== '' && !isNaN(Number(v))).length;
  const booleanValues = values.filter((v) =>
    ['true', 'false', '1', '0', 'yes', 'no'].includes(v.toLowerCase())
  ).length;

  const longestKey = keys.reduce((a, b) => (a.length >= b.length ? a : b), '');
  const longestValue = values.reduce((a, b) => (a.length >= b.length ? a : b), '');
  const averageValueLength =
    values.length > 0
      ? Math.round(values.reduce((sum, v) => sum + v.length, 0) / values.length)
      : 0;

  const byPrefix: Record<string, number> = {};
  for (const key of keys) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      byPrefix[prefix] = (byPrefix[prefix] ?? 0) + 1;
    }
  }

  const valueFrequency: Record<string, number> = {};
  for (const value of values) {
    if (value !== '') {
      valueFrequency[value] = (valueFrequency[value] ?? 0) + 1;
    }
  }

  return {
    stats: {
      totalKeys: keys.length,
      uniqueValues,
      emptyValues,
      numericValues,
      booleanValues,
      longestKey,
      longestValue,
      averageValueLength,
    },
    byPrefix,
    valueFrequency,
  };
}

export function formatAggregateResult(result: AggregateResult): string {
  const { stats, byPrefix, valueFrequency } = result;
  const lines: string[] = [
    '=== Aggregate Stats ===',
    `Total keys       : ${stats.totalKeys}`,
    `Unique values    : ${stats.uniqueValues}`,
    `Empty values     : ${stats.emptyValues}`,
    `Numeric values   : ${stats.numericValues}`,
    `Boolean values   : ${stats.booleanValues}`,
    `Longest key      : ${stats.longestKey}`,
    `Avg value length : ${stats.averageValueLength}`,
  ];

  const prefixEntries = Object.entries(byPrefix).sort((a, b) => b[1] - a[1]);
  if (prefixEntries.length > 0) {
    lines.push('', '=== Keys by Prefix ===');
    for (const [prefix, count] of prefixEntries) {
      lines.push(`  ${prefix}_* : ${count}`);
    }
  }

  const freqEntries = Object.entries(valueFrequency)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (freqEntries.length > 0) {
    lines.push('', '=== Most Repeated Values ===');
    for (const [value, count] of freqEntries) {
      const display = value.length > 30 ? value.slice(0, 27) + '...' : value;
      lines.push(`  "${display}" : ${count}x`);
    }
  }

  return lines.join('\n');
}
