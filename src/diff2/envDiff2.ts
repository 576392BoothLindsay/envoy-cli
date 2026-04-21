export type DiffMode = 'symmetric' | 'left' | 'right';

export interface KeyDiff {
  key: string;
  leftValue?: string;
  rightValue?: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
}

export interface Diff2Result {
  diffs: KeyDiff[];
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export function computeDiff2(
  left: Record<string, string>,
  right: Record<string, string>,
  mode: DiffMode = 'symmetric'
): Diff2Result {
  const allKeys = new Set([
    ...Object.keys(left),
    ...Object.keys(right),
  ]);

  const diffs: KeyDiff[] = [];

  for (const key of allKeys) {
    const inLeft = Object.prototype.hasOwnProperty.call(left, key);
    const inRight = Object.prototype.hasOwnProperty.call(right, key);

    if (inLeft && inRight) {
      diffs.push({
        key,
        leftValue: left[key],
        rightValue: right[key],
        status: left[key] === right[key] ? 'unchanged' : 'changed',
      });
    } else if (inLeft && !inRight) {
      if (mode !== 'right') {
        diffs.push({ key, leftValue: left[key], status: 'removed' });
      }
    } else if (!inLeft && inRight) {
      if (mode !== 'left') {
        diffs.push({ key, rightValue: right[key], status: 'added' });
      }
    }
  }

  diffs.sort((a, b) => a.key.localeCompare(b.key));

  return {
    diffs,
    added: diffs.filter((d) => d.status === 'added').length,
    removed: diffs.filter((d) => d.status === 'removed').length,
    changed: diffs.filter((d) => d.status === 'changed').length,
    unchanged: diffs.filter((d) => d.status === 'unchanged').length,
  };
}

export function formatDiff2Result(result: Diff2Result, showUnchanged = false): string {
  const lines: string[] = [];

  for (const d of result.diffs) {
    if (d.status === 'unchanged' && !showUnchanged) continue;
    if (d.status === 'added') {
      lines.push(`+ ${d.key}=${d.rightValue}`);
    } else if (d.status === 'removed') {
      lines.push(`- ${d.key}=${d.leftValue}`);
    } else if (d.status === 'changed') {
      lines.push(`~ ${d.key}: ${d.leftValue} → ${d.rightValue}`);
    } else {
      lines.push(`  ${d.key}=${d.leftValue}`);
    }
  }

  lines.push('');
  lines.push(
    `Summary: +${result.added} added, -${result.removed} removed, ~${result.changed} changed, ${result.unchanged} unchanged`
  );

  return lines.join('\n');
}
