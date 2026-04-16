import { EnvRecord } from '../parser/envParser';

export interface PrefixResult {
  added: string[];
  removed: string[];
  env: EnvRecord;
}

export function addPrefix(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

export function removePrefix(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function hasPrefix(key: string, prefix: string): boolean {
  return key.startsWith(prefix);
}

export function listKeysWithPrefix(env: EnvRecord, prefix: string): string[] {
  return Object.keys(env).filter(k => k.startsWith(prefix));
}

export function formatPrefixResult(result: PrefixResult): string {
  const lines: string[] = [];
  if (result.added.length > 0) {
    lines.push(`Added prefix to ${result.added.length} key(s):`);
    result.added.forEach(k => lines.push(`  + ${k}`));
  }
  if (result.removed.length > 0) {
    lines.push(`Removed prefix from ${result.removed.length} key(s):`);
    result.removed.forEach(k => lines.push(`  - ${k}`));
  }
  if (lines.length === 0) lines.push('No keys affected.');
  return lines.join('\n');
}
