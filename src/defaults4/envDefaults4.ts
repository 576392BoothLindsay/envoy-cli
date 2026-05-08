import { parseEnv } from '../parser/envParser';

export interface Defaults4Options {
  override?: boolean;
  keys?: string[];
}

export interface Defaults4Result {
  original: Record<string, string>;
  defaults: Record<string, string>;
  result: Record<string, string>;
  applied: string[];
  skipped: string[];
}

export function applyDefaults4(
  env: Record<string, string>,
  defaults: Record<string, string>,
  options: Defaults4Options = {}
): Defaults4Result {
  const { override = false, keys } = options;
  const result: Record<string, string> = { ...env };
  const applied: string[] = [];
  const skipped: string[] = [];

  const targetKeys = keys ? keys : Object.keys(defaults);

  for (const key of targetKeys) {
    if (!(key in defaults)) continue;
    const hasValue = key in env && env[key] !== '';
    if (!hasValue || override) {
      result[key] = defaults[key];
      applied.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { original: env, defaults, result, applied, skipped };
}

export function getMissingDefaults4(
  env: Record<string, string>,
  defaults: Record<string, string>
): string[] {
  return Object.keys(defaults).filter(
    (key) => !(key in env) || env[key] === ''
  );
}

export function formatDefaults4Result(result: Defaults4Result): string {
  const lines: string[] = [];
  if (result.applied.length > 0) {
    lines.push(`Applied defaults for: ${result.applied.join(', ')}`);
  }
  if (result.skipped.length > 0) {
    lines.push(`Skipped (already set): ${result.skipped.join(', ')}`);
  }
  if (result.applied.length === 0 && result.skipped.length === 0) {
    lines.push('No defaults to apply.');
  }
  return lines.join('\n');
}
