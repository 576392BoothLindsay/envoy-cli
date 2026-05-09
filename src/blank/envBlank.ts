import { parseEnv } from '../parser/envParser';

export interface BlankResult {
  blanked: Record<string, string>;
  keys: string[];
  count: number;
}

/**
 * Blank out specific keys by setting their values to empty string.
 */
export function blankKeys(
  env: Record<string, string>,
  keys: string[]
): Record<string, string> {
  const result = { ...env };
  for (const key of keys) {
    if (key in result) {
      result[key] = '';
    }
  }
  return result;
}

/**
 * Blank out keys matching a regex pattern.
 */
export function blankByPattern(
  env: Record<string, string>,
  pattern: string
): Record<string, string> {
  const regex = new RegExp(pattern);
  const result = { ...env };
  for (const key of Object.keys(result)) {
    if (regex.test(key)) {
      result[key] = '';
    }
  }
  return result;
}

/**
 * Get keys that are already blank (empty string).
 */
export function getBlankKeys(env: Record<string, string>): string[] {
  return Object.keys(env).filter((k) => env[k] === '');
}

export function formatBlankResult(result: BlankResult): string {
  if (result.count === 0) {
    return 'No keys were blanked.';
  }
  const lines = result.keys.map((k) => `  ${k}=`);
  return `Blanked ${result.count} key(s):\n${lines.join('\n')}`;
}

export function buildBlankResult(
  original: Record<string, string>,
  blanked: Record<string, string>
): BlankResult {
  const keys = Object.keys(blanked).filter(
    (k) => blanked[k] === '' && original[k] !== ''
  );
  return { blanked, keys, count: keys.length };
}
