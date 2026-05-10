import { EnvRecord } from '../parser/envParser';

export interface CopyResult {
  source: EnvRecord;
  destination: EnvRecord;
  copiedKeys: string[];
  skippedKeys: string[];
}

/**
 * Copy specific keys from source env to destination env.
 * By default, existing keys in destination are not overwritten.
 */
export function copyKeys(
  source: EnvRecord,
  destination: EnvRecord,
  keys: string[],
  options: { overwrite?: boolean } = {}
): CopyResult {
  const { overwrite = false } = options;
  const result: EnvRecord = { ...destination };
  const copiedKeys: string[] = [];
  const skippedKeys: string[] = [];

  for (const key of keys) {
    if (!(key in source)) {
      skippedKeys.push(key);
      continue;
    }
    if (!overwrite && key in destination) {
      skippedKeys.push(key);
      continue;
    }
    result[key] = source[key];
    copiedKeys.push(key);
  }

  return {
    source,
    destination: result,
    copiedKeys,
    skippedKeys,
  };
}

/**
 * Copy all keys from source into destination.
 */
export function copyAllKeys(
  source: EnvRecord,
  destination: EnvRecord,
  options: { overwrite?: boolean } = {}
): CopyResult {
  return copyKeys(source, destination, Object.keys(source), options);
}

export function formatCopyResult(result: CopyResult): string {
  const lines: string[] = [];
  if (result.copiedKeys.length > 0) {
    lines.push(`Copied (${result.copiedKeys.length}): ${result.copiedKeys.join(', ')}`);
  }
  if (result.skippedKeys.length > 0) {
    lines.push(`Skipped (${result.skippedKeys.length}): ${result.skippedKeys.join(', ')}`);
  }
  if (lines.length === 0) {
    lines.push('Nothing copied.');
  }
  return lines.join('\n');
}
