import { EnvMap } from '../parser/envParser';

export type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  status: DiffStatus;
  oldValue?: string;
  newValue?: string;
}

export interface DiffResult {
  entries: DiffEntry[];
  hasChanges: boolean;
  summary: {
    added: number;
    removed: number;
    changed: number;
    unchanged: number;
  };
}

/**
 * Compares two env maps and returns a structured diff result.
 * @param base - The base/original env map (e.g. local)
 * @param target - The target env map (e.g. remote or another environment)
 */
export function diffEnv(base: EnvMap, target: EnvMap): DiffResult {
  const entries: DiffEntry[] = [];
  const allKeys = new Set([...Object.keys(base), ...Object.keys(target)]);

  const summary = { added: 0, removed: 0, changed: 0, unchanged: 0 };

  for (const key of Array.from(allKeys).sort()) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTarget = Object.prototype.hasOwnProperty.call(target, key);

    if (!inBase && inTarget) {
      entries.push({ key, status: 'added', newValue: target[key] });
      summary.added++;
    } else if (inBase && !inTarget) {
      entries.push({ key, status: 'removed', oldValue: base[key] });
      summary.removed++;
    } else if (base[key] !== target[key]) {
      entries.push({ key, status: 'changed', oldValue: base[key], newValue: target[key] });
      summary.changed++;
    } else {
      entries.push({ key, status: 'unchanged', oldValue: base[key], newValue: target[key] });
      summary.unchanged++;
    }
  }

  const hasChanges = summary.added > 0 || summary.removed > 0 || summary.changed > 0;

  return { entries, hasChanges, summary };
}

/**
 * Formats a DiffResult into a human-readable string.
 */
export function formatDiff(result: DiffResult, showUnchanged = false): string {
  const lines: string[] = [];

  for (const entry of result.entries) {
    if (entry.status === 'unchanged' && !showUnchanged) continue;

    switch (entry.status) {
      case 'added':
        lines.push(`+ ${entry.key}=${entry.newValue}`);
        break;
      case 'removed':
        lines.push(`- ${entry.key}=${entry.oldValue}`);
        break;
      case 'changed':
        lines.push(`~ ${entry.key}: ${entry.oldValue} → ${entry.newValue}`);
        break;
      case 'unchanged':
        lines.push(`  ${entry.key}=${entry.oldValue}`);
        break;
    }
  }

  if (!result.hasChanges) {
    lines.push('No differences found.');
  }

  return lines.join('\n');
}
