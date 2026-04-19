import { EnvRecord } from '../parser/envParser';

export interface UnmaskResult {
  original: EnvRecord;
  unmasked: EnvRecord;
  restoredKeys: string[];
}

/**
 * Restore masked values using a reference (unmasked) env record.
 * Any key whose value matches the mask pattern is replaced with the reference value.
 */
export function unmaskEnv(
  masked: EnvRecord,
  reference: EnvRecord,
  maskChar = '*'
): UnmaskResult {
  const unmasked: EnvRecord = { ...masked };
  const restoredKeys: string[] = [];

  for (const key of Object.keys(masked)) {
    const maskedVal = masked[key];
    if (isMasked(maskedVal, maskChar) && key in reference) {
      unmasked[key] = reference[key];
      restoredKeys.push(key);
    }
  }

  return { original: masked, unmasked, restoredKeys };
}

/**
 * Determine if a value looks like a masked value (all mask characters).
 */
export function isMasked(value: string, maskChar = '*'): boolean {
  return value.length > 0 && [...value].every(c => c === maskChar);
}

export function formatUnmaskResult(result: UnmaskResult): string {
  if (result.restoredKeys.length === 0) {
    return 'No masked values were restored.';
  }
  const lines = result.restoredKeys.map(k => `  restored: ${k}`);
  return `Unmasked ${result.restoredKeys.length} key(s):\n${lines.join('\n')}`;
}
