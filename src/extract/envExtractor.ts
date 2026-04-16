export type ExtractResult = {
  extracted: Record<string, string>;
  remaining: Record<string, string>;
  keys: string[];
};

export function extractKeys(
  env: Record<string, string>,
  keys: string[]
): ExtractResult {
  const extracted: Record<string, string> = {};
  const remaining: Record<string, string> = {};

  for (const [k, v] of Object.entries(env)) {
    if (keys.includes(k)) {
      extracted[k] = v;
    } else {
      remaining[k] = v;
    }
  }

  return { extracted, remaining, keys: Object.keys(extracted) };
}

export function extractByPattern(
  env: Record<string, string>,
  pattern: string
): ExtractResult {
  const regex = new RegExp(pattern);
  const keys = Object.keys(env).filter((k) => regex.test(k));
  return extractKeys(env, keys);
}

export function formatExtractResult(result: ExtractResult): string {
  const lines: string[] = [];
  lines.push(`Extracted ${result.keys.length} key(s):`);
  for (const k of result.keys) {
    lines.push(`  + ${k}=${result.extracted[k]}`);
  }
  lines.push(`Remaining: ${Object.keys(result.remaining).length} key(s)`);
  return lines.join('\n');
}
