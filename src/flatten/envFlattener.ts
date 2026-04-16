export type EnvRecord = Record<string, string>;

export interface FlattenOptions {
  separator?: string;
  prefix?: string;
}

export interface FlattenResult {
  original: EnvRecord;
  flattened: EnvRecord;
  count: number;
}

export function flattenNested(
  obj: Record<string, unknown>,
  options: FlattenOptions = {},
  parentKey = ''
): EnvRecord {
  const { separator = '_', prefix = '' } = options;
  const result: EnvRecord = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}${separator}${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenNested(value as Record<string, unknown>, { separator }, fullKey));
    } else {
      const envKey = (prefix ? `${prefix}${separator}${fullKey}` : fullKey).toUpperCase();
      result[envKey] = Array.isArray(value) ? value.join(',') : String(value ?? '');
    }
  }

  return result;
}

export function flattenEnv(env: EnvRecord, options: FlattenOptions = {}): FlattenResult {
  const { separator = '__', prefix = '' } = options;
  const flattened: EnvRecord = {};

  for (const [key, value] of Object.entries(env)) {
    try {
      const parsed = JSON.parse(value);
      if (parsed !== null && typeof parsed === 'object') {
        const nested = flattenNested(parsed, { separator, prefix: prefix ? `${prefix}_${key}` : key });
        Object.assign(flattened, nested);
        continue;
      }
    } catch {
      // not JSON, keep as-is
    }
    const finalKey = prefix ? `${prefix}_${key}`.toUpperCase() : key;
    flattened[finalKey] = value;
  }

  return { original: env, flattened, count: Object.keys(flattened).length };
}

export function formatFlattenResult(result: FlattenResult): string {
  const lines: string[] = [`Flattened ${result.count} keys:`];
  for (const [k, v] of Object.entries(result.flattened)) {
    lines.push(`  ${k}=${v}`);
  }
  return lines.join('\n');
}
