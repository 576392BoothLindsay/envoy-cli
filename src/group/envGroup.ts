export interface GroupResult {
  groups: Record<string, Record<string, string>>;
  ungrouped: Record<string, string>;
}

export interface FormatGroupOptions {
  separator?: string;
  showUngrouped?: boolean;
}

/**
 * Groups env keys by a delimiter (default: '_') using the first segment as group name.
 */
export function groupByPrefix(
  env: Record<string, string>,
  delimiter = '_'
): GroupResult {
  const groups: Record<string, Record<string, string>> = {};
  const ungrouped: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const idx = key.indexOf(delimiter);
    if (idx > 0) {
      const prefix = key.slice(0, idx);
      const rest = key.slice(idx + 1);
      if (!groups[prefix]) groups[prefix] = {};
      groups[prefix][rest] = value;
    } else {
      ungrouped[key] = value;
    }
  }

  return { groups, ungrouped };
}

/**
 * Flattens a grouped structure back into a flat env record.
 */
export function flattenGroups(
  result: GroupResult,
  delimiter = '_'
): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [prefix, keys] of Object.entries(result.groups)) {
    for (const [key, value] of Object.entries(keys)) {
      flat[`${prefix}${delimiter}${key}`] = value;
    }
  }

  for (const [key, value] of Object.entries(result.ungrouped)) {
    flat[key] = value;
  }

  return flat;
}

/**
 * Formats a GroupResult into a human-readable string.
 */
export function formatGroupResult(
  result: GroupResult,
  options: FormatGroupOptions = {}
): string {
  const { showUngrouped = true } = options;
  const lines: string[] = [];

  for (const [group, keys] of Object.entries(result.groups)) {
    lines.push(`[${group}]`);
    for (const [key, value] of Object.entries(keys)) {
      lines.push(`  ${key}=${value}`);
    }
  }

  if (showUngrouped && Object.keys(result.ungrouped).length > 0) {
    lines.push('[ungrouped]');
    for (const [key, value] of Object.entries(result.ungrouped)) {
      lines.push(`  ${key}=${value}`);
    }
  }

  return lines.join('\n');
}
