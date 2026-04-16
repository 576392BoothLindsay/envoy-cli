import { EnvRecord } from '../parser/envParser';

export interface UniqueResult {
  unique: EnvRecord;
  duplicateKeys: string[];
  duplicateValues: Map<string, string[]>;
}

/**
 * Returns only keys with unique values (no two keys share the same value).
 */
export function uniqueByValue(env: EnvRecord): UniqueResult {
  const valueCounts = new Map<string, string[]>();

  for (const [key, value] of Object.entries(env)) {
    if (!valueCounts.has(value)) {
      valueCounts.set(value, []);
    }
    valueCounts.get(value)!.push(key);
  }

  const duplicateValues = new Map<string, string[]>();
  const duplicateKeys = new Set<string>();

  for (const [value, keys] of valueCounts.entries()) {
    if (keys.length > 1) {
      duplicateValues.set(value, keys);
      keys.forEach(k => duplicateKeys.add(k));
    }
  }

  const unique: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    if (!duplicateKeys.has(key)) {
      unique[key] = value;
    }
  }

  return { unique, duplicateKeys: [...duplicateKeys], duplicateValues };
}

export function formatUniqueResult(result: UniqueResult): string {
  const lines: string[] = [];

  if (result.duplicateKeys.length === 0) {
    lines.push('All values are unique.');
    return lines.join('\n');
  }

  lines.push(`Found ${result.duplicateValues.size} shared value(s) across ${result.duplicateKeys.length} key(s):`);

  for (const [value, keys] of result.duplicateValues.entries()) {
    const display = value.length > 20 ? value.slice(0, 20) + '...' : value;
    lines.push(`  "${display}" => ${keys.join(', ')}`);
  }

  lines.push(`\nUnique keys retained: ${Object.keys(result.unique).length}`);

  return lines.join('\n');
}
