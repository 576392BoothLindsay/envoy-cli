import { EnvRecord } from '../parser/envParser';

export interface JoinOptions {
  separator?: string;
  keys?: string[];
  prefix?: string;
}

export interface JoinResult {
  joined: Record<string, string>;
  count: number;
  keys: string[];
}

/**
 * Joins multiple env values into a single concatenated value per key group.
 * Groups keys by stripping a numeric suffix (e.g. DB_HOST_1, DB_HOST_2 -> DB_HOST).
 */
export function joinEnv(
  env: EnvRecord,
  options: JoinOptions = {}
): JoinResult {
  const { separator = ',', keys, prefix } = options;
  const groups: Record<string, string[]> = {};

  const entries = Object.entries(env);

  for (const [key, value] of entries) {
    if (keys && !keys.some((k) => key.startsWith(k))) continue;
    if (prefix && !key.startsWith(prefix)) continue;

    const match = key.match(/^(.+?)_(\d+)$/);
    if (match) {
      const base = match[1];
      if (!groups[base]) groups[base] = [];
      groups[base].push(value);
    }
  }

  const joined: Record<string, string> = {};
  for (const [base, values] of Object.entries(groups)) {
    joined[base] = values.join(separator);
  }

  return {
    joined,
    count: Object.keys(joined).length,
    keys: Object.keys(joined),
  };
}

export function formatJoinResult(result: JoinResult): string {
  if (result.count === 0) {
    return 'No joinable key groups found.';
  }
  const lines = [`Joined ${result.count} key group(s):`, ''];
  for (const key of result.keys) {
    lines.push(`  ${key} = ${result.joined[key]}`);
  }
  return lines.join('\n');
}
