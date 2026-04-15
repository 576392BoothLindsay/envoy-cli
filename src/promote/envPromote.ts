import { EnvRecord } from '../parser/envParser';

export type PromoteStrategy = 'overwrite' | 'skip' | 'merge';

export interface PromoteOptions {
  strategy?: PromoteStrategy;
  keys?: string[];
  excludeKeys?: string[];
}

export interface PromoteResult {
  promoted: Record<string, { from: string | undefined; to: string }>;
  skipped: string[];
  unchanged: string[];
}

export function promoteEnv(
  source: EnvRecord,
  target: EnvRecord,
  options: PromoteOptions = {}
): { result: EnvRecord; summary: PromoteResult } {
  const { strategy = 'overwrite', keys, excludeKeys = [] } = options;

  const keysToPromote = keys ?? Object.keys(source);
  const filtered = keysToPromote.filter((k) => !excludeKeys.includes(k));

  const result: EnvRecord = { ...target };
  const summary: PromoteResult = { promoted: {}, skipped: [], unchanged: [] };

  for (const key of filtered) {
    if (!(key in source)) continue;

    const sourceVal = source[key];
    const targetVal = target[key];

    if (strategy === 'skip' && key in target) {
      summary.skipped.push(key);
      continue;
    }

    if (strategy === 'merge' && key in target && targetVal === sourceVal) {
      summary.unchanged.push(key);
      continue;
    }

    result[key] = sourceVal;
    summary.promoted[key] = { from: targetVal, to: sourceVal };
  }

  return { result, summary };
}

export function formatPromoteResult(summary: PromoteResult): string {
  const lines: string[] = [];

  const promotedKeys = Object.keys(summary.promoted);
  if (promotedKeys.length > 0) {
    lines.push(`Promoted (${promotedKeys.length}):`);
    for (const key of promotedKeys) {
      const { from, to } = summary.promoted[key];
      const fromStr = from !== undefined ? `"${from}"` : '(unset)';
      lines.push(`  ${key}: ${fromStr} → "${to}"`);
    }
  }

  if (summary.skipped.length > 0) {
    lines.push(`Skipped (${summary.skipped.length}): ${summary.skipped.join(', ')}`);
  }

  if (summary.unchanged.length > 0) {
    lines.push(`Unchanged (${summary.unchanged.length}): ${summary.unchanged.join(', ')}`);
  }

  return lines.join('\n');
}
