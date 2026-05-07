import { parseEnv, serializeEnv } from '../parser/envParser';

export interface StripResult {
  original: Record<string, string>;
  stripped: Record<string, string>;
  removedKeys: string[];
}

/**
 * Strip keys from an env record that have empty, blank, or null-like values.
 */
export function stripBlankValues(env: Record<string, string>): StripResult {
  const stripped: Record<string, string> = {};
  const removedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (value.trim() === '' || value === 'null' || value === 'undefined') {
      removedKeys.push(key);
    } else {
      stripped[key] = value;
    }
  }

  return { original: env, stripped, removedKeys };
}

/**
 * Strip keys matching a given list of key names.
 */
export function stripKeys(
  env: Record<string, string>,
  keys: string[]
): StripResult {
  const keySet = new Set(keys);
  const stripped: Record<string, string> = {};
  const removedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (keySet.has(key)) {
      removedKeys.push(key);
    } else {
      stripped[key] = value;
    }
  }

  return { original: env, stripped, removedKeys };
}

/**
 * Strip keys matching a regex pattern.
 */
export function stripByPattern(
  env: Record<string, string>,
  pattern: RegExp
): StripResult {
  const stripped: Record<string, string> = {};
  const removedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (pattern.test(key)) {
      removedKeys.push(key);
    } else {
      stripped[key] = value;
    }
  }

  return { original: env, stripped, removedKeys };
}

export function formatStripResult(result: StripResult): string {
  const lines: string[] = [];
  lines.push(`Stripped ${result.removedKeys.length} key(s).`);
  if (result.removedKeys.length > 0) {
    lines.push('Removed keys:');
    for (const key of result.removedKeys) {
      lines.push(`  - ${key}`);
    }
  }
  lines.push('');
  lines.push(serializeEnv(result.stripped));
  return lines.join('\n');
}
