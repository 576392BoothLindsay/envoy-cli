export interface SearchResult {
  key: string;
  value: string;
  matchedOn: 'key' | 'value' | 'both';
}

export interface SearchOptions {
  caseSensitive?: boolean;
  matchKeys?: boolean;
  matchValues?: boolean;
  regex?: boolean;
}

export function searchEnv(
  env: Record<string, string>,
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const { caseSensitive = false, matchKeys = true, matchValues = true, regex = false } = options;

  const results: SearchResult[] = [];

  const matches = (text: string): boolean => {
    if (regex) {
      const flags = caseSensitive ? '' : 'i';
      return new RegExp(query, flags).test(text);
    }
    const a = caseSensitive ? text : text.toLowerCase();
    const b = caseSensitive ? query : query.toLowerCase();
    return a.includes(b);
  };

  for (const [key, value] of Object.entries(env)) {
    const keyMatch = matchKeys && matches(key);
    const valueMatch = matchValues && matches(value);

    if (keyMatch || valueMatch) {
      results.push({
        key,
        value,
        matchedOn: keyMatch && valueMatch ? 'both' : keyMatch ? 'key' : 'value',
      });
    }
  }

  return results;
}

export function formatSearchResult(results: SearchResult[], query: string): string {
  if (results.length === 0) {
    return `No matches found for "${query}".`;
  }
  const lines = results.map(
    (r) => `  ${r.key}=${r.value}  (matched: ${r.matchedOn})`
  );
  return `Found ${results.length} match(es) for "${query}":\n${lines.join('\n')}`;
}
