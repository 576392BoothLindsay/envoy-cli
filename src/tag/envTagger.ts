export interface TagResult {
  tagged: Record<string, string>;
  tags: Record<string, string[]>;
  count: number;
}

export function tagKeys(
  env: Record<string, string>,
  keys: string[],
  tag: string
): Record<string, string> {
  const result: Record<string, string> = { ...env };
  for (const key of keys) {
    if (key in result) {
      const metaKey = `__TAG_${key}`;
      const existing = result[metaKey] ? result[metaKey].split(',') : [];
      if (!existing.includes(tag)) {
        existing.push(tag);
      }
      result[metaKey] = existing.join(',');
    }
  }
  return result;
}

export function getTagsForKey(
  env: Record<string, string>,
  key: string
): string[] {
  const metaKey = `__TAG_${key}`;
  if (!env[metaKey]) return [];
  return env[metaKey].split(',').filter(Boolean);
}

export function getKeysByTag(
  env: Record<string, string>,
  tag: string
): string[] {
  const result: string[] = [];
  for (const [k, v] of Object.entries(env)) {
    if (k.startsWith('__TAG_')) {
      const originalKey = k.slice(6);
      if (v.split(',').includes(tag)) {
        result.push(originalKey);
      }
    }
  }
  return result;
}

export function formatTagResult(result: TagResult): string {
  const lines: string[] = [`Tagged ${result.count} key(s).`];
  for (const [key, tags] of Object.entries(result.tags)) {
    lines.push(`  ${key}: [${tags.join(', ')}]`);
  }
  return lines.join('\n');
}
