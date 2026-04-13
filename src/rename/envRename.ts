export interface RenameOperation {
  oldKey: string;
  newKey: string;
}

export interface RenameResult {
  renamed: RenameOperation[];
  skipped: RenameOperation[];
  notFound: string[];
}

/**
 * Rename a single key in an env record.
 * Returns null if the key does not exist.
 */
export function renameKey(
  env: Record<string, string>,
  oldKey: string,
  newKey: string
): Record<string, string> | null {
  if (!(oldKey in env)) return null;

  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (k === oldKey) {
      result[newKey] = v;
    } else {
      result[k] = v;
    }
  }
  return result;
}

/**
 * Apply multiple rename operations to an env record.
 * Skips operations where newKey already exists (unless overwrite is true).
 */
export function renameKeys(
  env: Record<string, string>,
  operations: RenameOperation[],
  overwrite = false
): { env: Record<string, string>; result: RenameResult } {
  const renameResult: RenameResult = { renamed: [], skipped: [], notFound: [] };
  let current = { ...env };

  for (const op of operations) {
    if (!(op.oldKey in current)) {
      renameResult.notFound.push(op.oldKey);
      continue;
    }
    if (op.newKey in current && !overwrite) {
      renameResult.skipped.push(op);
      continue;
    }
    const updated = renameKey(current, op.oldKey, op.newKey);
    if (updated) {
      current = updated;
      renameResult.renamed.push(op);
    }
  }

  return { env: current, result: renameResult };
}

/**
 * Format a RenameResult into a human-readable string.
 */
export function formatRenameResult(result: RenameResult): string {
  const lines: string[] = [];
  if (result.renamed.length > 0) {
    lines.push('Renamed:');
    result.renamed.forEach(op => lines.push(`  ${op.oldKey} → ${op.newKey}`));
  }
  if (result.skipped.length > 0) {
    lines.push('Skipped (key already exists):');
    result.skipped.forEach(op => lines.push(`  ${op.oldKey} → ${op.newKey}`));
  }
  if (result.notFound.length > 0) {
    lines.push('Not found:');
    result.notFound.forEach(k => lines.push(`  ${k}`));
  }
  return lines.join('\n');
}
