import { EnvRecord } from '../parser/envParser';

export interface UnionResult {
  union: EnvRecord;
  addedKeys: string[];
  commonKeys: string[];
}

/**
 * Merge two env records, keeping all keys from both.
 * When a key exists in both, the value from `override` is used.
 */
export function unionEnvs(
  base: EnvRecord,
  override: EnvRecord
): UnionResult {
  const union: EnvRecord = { ...base };
  const addedKeys: string[] = [];
  const commonKeys: string[] = [];

  for (const [key, value] of Object.entries(override)) {
    if (key in base) {
      commonKeys.push(key);
    } else {
      addedKeys.push(key);
    }
    union[key] = value;
  }

  return { union, addedKeys, commonKeys };
}

export function formatUnionResult(result: UnionResult): string {
  const lines: string[] = [];
  lines.push(`Union: ${Object.keys(result.union).length} total keys`);
  if (result.addedKeys.length > 0) {
    lines.push(`Added from override (${result.addedKeys.length}): ${result.addedKeys.join(', ')}`);
  }
  if (result.commonKeys.length > 0) {
    lines.push(`Common keys (override wins, ${result.commonKeys.length}): ${result.commonKeys.join(', ')}`);
  }
  return lines.join('\n');
}
