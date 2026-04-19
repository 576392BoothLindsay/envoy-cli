import { EnvRecord } from '../parser/envParser';

export interface SubtractResult {
  result: EnvRecord;
  removedKeys: string[];
  remainingCount: number;
}

/**
 * Subtract keys present in `subtrahend` from `minuend`.
 * Returns only keys that exist in minuend but NOT in subtrahend.
 */
export function subtractEnv(
  minuend: EnvRecord,
  subtrahend: EnvRecord
): SubtractResult {
  const result: EnvRecord = {};
  const removedKeys: string[] = [];

  for (const key of Object.keys(minuend)) {
    if (key in subtrahend) {
      removedKeys.push(key);
    } else {
      result[key] = minuend[key];
    }
  }

  return {
    result,
    removedKeys,
    remainingCount: Object.keys(result).length,
  };
}

export function formatSubtractResult(subtractResult: SubtractResult): string {
  const lines: string[] = [];

  if (subtractResult.removedKeys.length === 0) {
    lines.push('No keys were removed.');
  } else {
    lines.push(`Removed ${subtractResult.removedKeys.length} key(s):`);
    for (const key of subtractResult.removedKeys) {
      lines.push(`  - ${key}`);
    }
  }

  lines.push(`Remaining keys: ${subtractResult.remainingCount}`);
  return lines.join('\n');
}
