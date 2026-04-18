export type InvertResult = {
  inverted: Record<string, string>;
  skipped: string[];
  count: number;
};

/**
 * Invert an env record: values become keys, keys become values.
 * Keys with duplicate values will be skipped (only first kept).
 */
export function invertEnv(
  env: Record<string, string>
): InvertResult {
  const inverted: Record<string, string> = {};
  const seen = new Set<string>();
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (!value) {
      skipped.push(key);
      continue;
    }
    if (seen.has(value)) {
      skipped.push(key);
      continue;
    }
    seen.add(value);
    inverted[value] = key;
  }

  return { inverted, skipped, count: Object.keys(inverted).length };
}

export function formatInvertResult(result: InvertResult): string {
  const lines: string[] = [];
  lines.push(`Inverted ${result.count} key(s).`);
  if (result.skipped.length > 0) {
    lines.push(`Skipped (empty or duplicate value): ${result.skipped.join(', ')}`);
  }
  return lines.join('\n');
}
