import { EnvRecord } from '../parser/envParser';

export interface SummaryResult {
  totalKeys: number;
  emptyValues: number;
  nonEmptyValues: number;
  uniqueValues: number;
  duplicateValues: number;
  longestKey: string;
  longestValue: string;
  averageValueLength: number;
  prefixes: Record<string, number>;
}

export function summarizeEnv(env: EnvRecord): SummaryResult {
  const keys = Object.keys(env);
  const values = Object.values(env);

  const emptyValues = values.filter(v => v === '').length;
  const nonEmptyValues = values.length - emptyValues;

  const valueSet = new Set(values.filter(v => v !== ''));
  const uniqueValues = valueSet.size;
  const duplicateValues = nonEmptyValues - uniqueValues;

  const longestKey = keys.reduce((a, b) => (b.length > a.length ? b : a), '');
  const longestValue = values.reduce((a, b) => (b.length > a.length ? b : a), '');

  const totalValueLength = values.reduce((sum, v) => sum + v.length, 0);
  const averageValueLength = keys.length > 0 ? Math.round(totalValueLength / keys.length) : 0;

  const prefixes: Record<string, number> = {};
  for (const key of keys) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
    }
  }

  return {
    totalKeys: keys.length,
    emptyValues,
    nonEmptyValues,
    uniqueValues,
    duplicateValues,
    longestKey,
    longestValue,
    averageValueLength,
    prefixes,
  };
}

export function formatSummaryResult(result: SummaryResult): string {
  const lines: string[] = [
    `Total keys:          ${result.totalKeys}`,
    `Non-empty values:    ${result.nonEmptyValues}`,
    `Empty values:        ${result.emptyValues}`,
    `Unique values:       ${result.uniqueValues}`,
    `Duplicate values:    ${result.duplicateValues}`,
    `Longest key:         ${result.longestKey || '(none)'}`,
    `Longest value:       ${result.longestValue.slice(0, 40) || '(none)'}`,
    `Avg value length:    ${result.averageValueLength}`,
  ];

  const prefixEntries = Object.entries(result.prefixes);
  if (prefixEntries.length > 0) {
    lines.push('\nKey prefixes:');
    for (const [prefix, count] of prefixEntries.sort((a, b) => b[1] - a[1])) {
      lines.push(`  ${prefix}_  (${count} key${count !== 1 ? 's' : ''})`);
    }
  }

  return lines.join('\n');
}
