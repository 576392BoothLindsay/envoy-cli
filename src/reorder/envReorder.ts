import { EnvRecord } from '../parser/envParser';

export interface ReorderResult {
  original: EnvRecord;
  reordered: EnvRecord;
  order: string[];
}

export function reorderKeys(env: EnvRecord, order: string[]): EnvRecord {
  const result: EnvRecord = {};
  // First, add keys in specified order
  for (const key of order) {
    if (key in env) {
      result[key] = env[key];
    }
  }
  // Then, append remaining keys not in order
  for (const key of Object.keys(env)) {
    if (!(key in result)) {
      result[key] = env[key];
    }
  }
  return result;
}

export function reorderByPattern(env: EnvRecord, patterns: string[]): EnvRecord {
  const matched: EnvRecord = {};
  const unmatched: EnvRecord = {};

  for (const key of Object.keys(env)) {
    const isMatch = patterns.some(p => new RegExp(p).test(key));
    if (isMatch) {
      matched[key] = env[key];
    } else {
      unmatched[key] = env[key];
    }
  }

  return { ...matched, ...unmatched };
}

export function formatReorderResult(result: ReorderResult): string {
  const lines: string[] = [];
  const originalKeys = Object.keys(result.original);
  const reorderedKeys = Object.keys(result.reordered);

  lines.push(`Reordered ${reorderedKeys.length} keys`);

  reorderedKeys.forEach((key, i) => {
    const oldIndex = originalKeys.indexOf(key);
    if (oldIndex !== i) {
      lines.push(`  ${key}: position ${oldIndex + 1} → ${i + 1}`);
    }
  });

  return lines.join('\n');
}
