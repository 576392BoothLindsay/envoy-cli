export type TrimTarget = 'keys' | 'values' | 'both';

export interface TrimOptions {
  target?: TrimTarget;
  removeEmptyLines?: boolean;
}

export interface TrimResult {
  original: Record<string, string>;
  trimmed: Record<string, string>;
  modifiedKeys: string[];
}

export function trimKey(key: string): string {
  return key.trim();
}

export function trimValue(value: string): string {
  return value.trim();
}

export function trimEnv(
  env: Record<string, string>,
  options: TrimOptions = {}
): TrimResult {
  const { target = 'both', removeEmptyLines = false } = options;
  const trimmed: Record<string, string> = {};
  const modifiedKeys: string[] = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    const newKey = target === 'values' ? rawKey : trimKey(rawKey);
    const newValue = target === 'keys' ? rawValue : trimValue(rawValue);

    if (removeEmptyLines && newValue === '') {
      modifiedKeys.push(rawKey);
      continue;
    }

    trimmed[newKey] = newValue;

    if (newKey !== rawKey || newValue !== rawValue) {
      modifiedKeys.push(rawKey);
    }
  }

  return { original: env, trimmed, modifiedKeys };
}

export function formatTrimResult(result: TrimResult): string {
  const { modifiedKeys, trimmed } = result;

  if (modifiedKeys.length === 0) {
    return 'No keys or values required trimming.';
  }

  const lines = [`Trimmed ${modifiedKeys.length} entr${modifiedKeys.length === 1 ? 'y' : 'ies'}:`];
  for (const key of modifiedKeys) {
    const newKey = Object.keys(trimmed).find(
      (k) => k === key.trim()
    ) ?? key.trim();
    lines.push(`  ${key} -> ${newKey}: "${trimmed[newKey] ?? '(removed)'}"`);
  }
  return lines.join('\n');
}
