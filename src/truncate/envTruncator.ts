export interface TruncateOptions {
  maxLength: number;
  suffix?: string;
  keys?: string[];
}

export interface TruncateResult {
  original: Record<string, string>;
  truncated: Record<string, string>;
  affectedKeys: string[];
}

export function truncateValue(value: string, maxLength: number, suffix = '...'): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - suffix.length) + suffix;
}

export function truncateEnv(
  env: Record<string, string>,
  options: TruncateOptions
): TruncateResult {
  const { maxLength, suffix = '...', keys } = options;
  const truncated: Record<string, string> = {};
  const affectedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldTruncate = !keys || keys.includes(key);
    if (shouldTruncate && value.length > maxLength) {
      truncated[key] = truncateValue(value, maxLength, suffix);
      affectedKeys.push(key);
    } else {
      truncated[key] = value;
    }
  }

  return { original: env, truncated, affectedKeys };
}

export function formatTruncateResult(result: TruncateResult): string {
  if (result.affectedKeys.length === 0) {
    return 'No values needed truncation.';
  }
  const lines = [`Truncated ${result.affectedKeys.length} key(s):`, ''];
  for (const key of result.affectedKeys) {
    lines.push(`  ${key}`);
    lines.push(`    before: ${result.original[key]}`);
    lines.push(`    after:  ${result.truncated[key]}`);
  }
  return lines.join('\n');
}
