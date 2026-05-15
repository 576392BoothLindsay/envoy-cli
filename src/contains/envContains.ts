export interface ContainsResult {
  matched: Record<string, string>;
  unmatched: Record<string, string>;
  matchedKeys: string[];
  total: number;
  matchCount: number;
}

export function containsValue(
  env: Record<string, string>,
  substring: string,
  caseSensitive = true
): ContainsResult {
  const matched: Record<string, string> = {};
  const unmatched: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const haystack = caseSensitive ? value : value.toLowerCase();
    const needle = caseSensitive ? substring : substring.toLowerCase();
    if (haystack.includes(needle)) {
      matched[key] = value;
    } else {
      unmatched[key] = value;
    }
  }

  return {
    matched,
    unmatched,
    matchedKeys: Object.keys(matched),
    total: Object.keys(env).length,
    matchCount: Object.keys(matched).length,
  };
}

export function containsKey(
  env: Record<string, string>,
  substring: string,
  caseSensitive = true
): ContainsResult {
  const matched: Record<string, string> = {};
  const unmatched: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const haystack = caseSensitive ? key : key.toLowerCase();
    const needle = caseSensitive ? substring : substring.toLowerCase();
    if (haystack.includes(needle)) {
      matched[key] = value;
    } else {
      unmatched[key] = value;
    }
  }

  return {
    matched,
    unmatched,
    matchedKeys: Object.keys(matched),
    total: Object.keys(env).length,
    matchCount: Object.keys(matched).length,
  };
}

export function formatContainsResult(result: ContainsResult): string {
  const lines: string[] = [];
  lines.push(`Matched: ${result.matchCount}/${result.total}`);
  for (const [key, value] of Object.entries(result.matched)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
