export type EnvRecord = Record<string, string>;

export interface PrefixResult {
  added: string[];
  removed: string[];
  unchanged: string[];
}

export function addPrefix(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = hasPrefix(key, prefix) ? key : `${prefix}${key}`;
    result[newKey] = value;
  }
  return result;
}

export function removePrefix(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = hasPrefix(key, prefix) ? key.slice(prefix.length) : key;
    result[newKey] = value;
  }
  return result;
}

export function hasPrefix(key: string, prefix: string): boolean {
  return key.startsWith(prefix);
}

export function listKeysWithPrefix(env: EnvRecord, prefix: string): string[] {
  return Object.keys(env).filter((key) => hasPrefix(key, prefix));
}

export function formatPrefixResult(result: PrefixResult): string {
  const lines: string[] = [];
  if (result.added.length > 0) lines.push(`Added prefix to: ${result.added.join(', ')}`);
  if (result.removed.length > 0) lines.push(`Removed prefix from: ${result.removed.join(', ')}`);
  if (result.unchanged.length > 0) lines.push(`Unchanged: ${result.unchanged.join(', ')}`);
  return lines.join('\n');
}
