import { EnvRecord } from '../parser/envParser';

export interface TailResult {
  entries: EnvRecord;
  total: number;
  taken: number;
}

/**
 * Returns the last `n` entries from an env record.
 */
export function tailEnv(env: EnvRecord, n: number): TailResult {
  const keys = Object.keys(env);
  const total = keys.length;
  const count = Math.max(0, Math.min(n, total));
  const takenKeys = keys.slice(total - count);

  const entries: EnvRecord = {};
  for (const key of takenKeys) {
    entries[key] = env[key];
  }

  return { entries, total, taken: takenKeys.length };
}

/**
 * Returns the last `n` entries whose keys start with a given prefix.
 */
export function tailByPrefix(env: EnvRecord, prefix: string, n: number): TailResult {
  const filtered: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      filtered[key] = value;
    }
  }
  return tailEnv(filtered, n);
}

/**
 * Formats a TailResult for CLI output.
 */
export function formatTailResult(result: TailResult): string {
  const lines: string[] = [];
  lines.push(`Showing last ${result.taken} of ${result.total} keys:`);
  for (const [key, value] of Object.entries(result.entries)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
