export interface PlaceholderOptions {
  prefix?: string;
  suffix?: string;
  fallback?: string;
}

export interface PlaceholderResult {
  resolved: Record<string, string>;
  missing: string[];
  replaced: number;
}

const DEFAULT_PREFIX = '{{';
const DEFAULT_SUFFIX = '}}';

export function findPlaceholders(
  value: string,
  prefix = DEFAULT_PREFIX,
  suffix = DEFAULT_SUFFIX
): string[] {
  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped(prefix)}\\s*([\\w.]+)\\s*${escaped(suffix)}`, 'g');
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(value)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

export function resolvePlaceholder(
  value: string,
  context: Record<string, string>,
  options: PlaceholderOptions = {}
): { resolved: string; missing: string[] } {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const suffix = options.suffix ?? DEFAULT_SUFFIX;
  const fallback = options.fallback;
  const missing: string[] = [];

  const escaped = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped(prefix)}\\s*([\\w.]+)\\s*${escaped(suffix)}`, 'g');

  const resolved = value.replace(pattern, (_, key) => {
    if (key in context) return context[key];
    missing.push(key);
    return fallback !== undefined ? fallback : `${prefix}${key}${suffix}`;
  });

  return { resolved, missing };
}

export function resolvePlaceholders(
  env: Record<string, string>,
  context: Record<string, string>,
  options: PlaceholderOptions = {}
): PlaceholderResult {
  const resolved: Record<string, string> = {};
  const allMissing = new Set<string>();
  let replaced = 0;

  for (const [key, value] of Object.entries(env)) {
    const { resolved: newValue, missing } = resolvePlaceholder(value, context, options);
    resolved[key] = newValue;
    missing.forEach((m) => allMissing.add(m));
    if (newValue !== value) replaced++;
  }

  return { resolved, missing: Array.from(allMissing), replaced };
}

export function formatPlaceholderResult(result: PlaceholderResult): string {
  const lines: string[] = [];
  lines.push(`Replaced: ${result.replaced} value(s)`);
  if (result.missing.length > 0) {
    lines.push(`Unresolved placeholders: ${result.missing.join(', ')}`);
  } else {
    lines.push('All placeholders resolved successfully.');
  }
  return lines.join('\n');
}
