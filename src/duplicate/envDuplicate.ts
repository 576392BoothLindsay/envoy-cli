import { EnvRecord } from '../parser/envParser';

export interface DuplicateEntry {
  key: string;
  value: string;
  count: number;
}

export interface DuplicateResult {
  duplicates: DuplicateEntry[];
  cleaned: EnvRecord;
  removedCount: number;
}

export function findDuplicateKeys(envs: EnvRecord[]): DuplicateEntry[] {
  const counts: Record<string, { value: string; count: number }> = {};

  for (const env of envs) {
    for (const [key, value] of Object.entries(env)) {
      if (counts[key]) {
        counts[key].count += 1;
      } else {
        counts[key] = { value, count: 1 };
      }
    }
  }

  return Object.entries(counts)
    .filter(([, { count }]) => count > 1)
    .map(([key, { value, count }]) => ({ key, value, count }));
}

export function removeDuplicateKeys(envs: EnvRecord[]): EnvRecord {
  const seen = new Set<string>();
  const result: EnvRecord = {};

  for (const env of envs) {
    for (const [key, value] of Object.entries(env)) {
      if (!seen.has(key)) {
        seen.add(key);
        result[key] = value;
      }
    }
  }

  return result;
}

export function duplicateEnv(envs: EnvRecord[]): DuplicateResult {
  const duplicates = findDuplicateKeys(envs);
  const cleaned = removeDuplicateKeys(envs);
  const removedCount = duplicates.reduce((sum, d) => sum + d.count - 1, 0);
  return { duplicates, cleaned, removedCount };
}

export function formatDuplicateResult(result: DuplicateResult): string {
  if (result.duplicates.length === 0) {
    return 'No duplicate keys found.';
  }
  const lines = result.duplicates.map(
    (d) => `  ${d.key} (appears ${d.count} times)`
  );
  return [
    `Found ${result.duplicates.length} duplicate key(s), removed ${result.removedCount} occurrence(s):`,
    ...lines,
  ].join('\n');
}
