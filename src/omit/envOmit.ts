export type OmitResult = {
  original: Record<string, string>;
  result: Record<string, string>;
  omitted: string[];
};

export function omitKeys(
  env: Record<string, string>,
  keys: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (!keys.includes(k)) {
      result[k] = v;
    }
  }
  return result;
}

export function omitByPattern(
  env: Record<string, string>,
  pattern: RegExp
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (!pattern.test(k)) {
      result[k] = v;
    }
  }
  return result;
}

export function formatOmitResult(result: OmitResult): string {
  const lines: string[] = [];
  if (result.omitted.length === 0) {
    lines.push('No keys omitted.');
  } else {
    lines.push(`Omitted ${result.omitted.length} key(s): ${result.omitted.join(', ')}`);
  }
  lines.push(`Remaining keys: ${Object.keys(result.result).length}`);
  return lines.join('\n');
}

export function buildOmitResult(
  original: Record<string, string>,
  keys: string[]
): OmitResult {
  const omitted = keys.filter((k) => k in original);
  const result = omitKeys(original, keys);
  return { original, result, omitted };
}
