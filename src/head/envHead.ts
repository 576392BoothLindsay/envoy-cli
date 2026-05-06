import { EnvRecord } from '../parser/envParser';

export interface HeadResult {
  entries: EnvRecord;
  total: number;
  taken: number;
}

/**
 * Returns the first `n` entries of an env record.
 */
export function headEnv(env: EnvRecord, n: number): HeadResult {
  if (n < 0) throw new RangeError('n must be a non-negative integer');

  const keys = Object.keys(env);
  const taken = Math.min(n, keys.length);
  const entries: EnvRecord = {};

  for (let i = 0; i < taken; i++) {
    entries[keys[i]] = env[keys[i]];
  }

  return { entries, total: keys.length, taken };
}

/**
 * Returns the first entry for each prefix group.
 */
export function headByPrefix(
  env: EnvRecord,
  n: number
): Record<string, EnvRecord> {
  const groups: Record<string, string[]> = {};

  for (const key of Object.keys(env)) {
    const prefix = key.includes('_') ? key.split('_')[0] : '__default__';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }

  const result: Record<string, EnvRecord> = {};
  for (const [prefix, keys] of Object.entries(groups)) {
    result[prefix] = {};
    const count = Math.min(n, keys.length);
    for (let i = 0; i < count; i++) {
      result[prefix][keys[i]] = env[keys[i]];
    }
  }

  return result;
}

export function formatHeadResult(result: HeadResult): string {
  const lines: string[] = [];
  lines.push(`# Showing ${result.taken} of ${result.total} entries`);
  for (const [key, value] of Object.entries(result.entries)) {
    lines.push(`${key}=${value}`);
  }
  return lines.join('\n');
}
