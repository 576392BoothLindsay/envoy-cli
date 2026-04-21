import { EnvRecord } from '../parser/envParser';

export interface ReverseResult {
  original: EnvRecord;
  reversed: EnvRecord;
  count: number;
}

/**
 * Reverses the order of keys in an env record.
 */
export function reverseEnv(env: EnvRecord): EnvRecord {
  const entries = Object.entries(env);
  const reversed = entries.reverse();
  return Object.fromEntries(reversed);
}

/**
 * Reverses the characters in each value of an env record.
 */
export function reverseValues(env: EnvRecord): EnvRecord {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, value.split('').reverse().join('')])
  );
}

/**
 * Reverses both key order and optionally the characters of each value.
 */
export function applyReverse(
  env: EnvRecord,
  options: { reverseValues?: boolean } = {}
): ReverseResult {
  let reversed = reverseEnv(env);
  if (options.reverseValues) {
    reversed = reverseValues(reversed);
  }
  return {
    original: env,
    reversed,
    count: Object.keys(reversed).length,
  };
}

export function formatReverseResult(result: ReverseResult): string {
  const lines: string[] = [];
  lines.push(`Reversed ${result.count} key(s).`);
  for (const [key, value] of Object.entries(result.reversed)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
