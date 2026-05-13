export interface CollapseResult {
  original: Record<string, string>;
  collapsed: Record<string, string>;
  collapsedKeys: string[];
}

/**
 * Collapse consecutive numeric-suffixed keys into a single comma-separated value.
 * e.g. HOST_1=a, HOST_2=b, HOST_3=c => HOSTS=a,b,c
 */
export function collapseEnv(
  env: Record<string, string>,
  separator = ","
): CollapseResult {
  const groups: Record<string, { base: string; entries: [number, string][] }> = {};

  for (const [key, value] of Object.entries(env)) {
    const match = key.match(/^(.+?)_(\d+)$/);
    if (match) {
      const base = match[1];
      const index = parseInt(match[2], 10);
      if (!groups[base]) groups[base] = { base, entries: [] };
      groups[base].entries.push([index, value]);
    }
  }

  const collapsed: Record<string, string> = { ...env };
  const collapsedKeys: string[] = [];

  for (const [base, group] of Object.entries(groups)) {
    if (group.entries.length < 2) continue;
    group.entries.sort((a, b) => a[0] - b[0]);
    const mergedKey = `${base}S`;
    const mergedValue = group.entries.map(([, v]) => v).join(separator);
    collapsed[mergedKey] = mergedValue;
    for (const [index] of group.entries) {
      const oldKey = `${base}_${index}`;
      delete collapsed[oldKey];
      collapsedKeys.push(oldKey);
    }
  }

  return { original: env, collapsed, collapsedKeys };
}

export function formatCollapseResult(result: CollapseResult): string {
  if (result.collapsedKeys.length === 0) {
    return "No collapsible key groups found.";
  }
  const lines: string[] = [`Collapsed ${result.collapsedKeys.length} key(s):`, ""];
  for (const key of result.collapsedKeys) {
    lines.push(`  - ${key}`);
  }
  lines.push("");
  lines.push("Result:");
  for (const [k, v] of Object.entries(result.collapsed)) {
    lines.push(`  ${k}=${v}`);
  }
  return lines.join("\n");
}
