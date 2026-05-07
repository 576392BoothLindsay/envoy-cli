export type PadDirection = 'start' | 'end' | 'both';

export interface PadOptions {
  length: number;
  char?: string;
  direction?: PadDirection;
  keys?: string[];
}

export interface PadResult {
  original: Record<string, string>;
  padded: Record<string, string>;
  changed: string[];
}

export function padValue(
  value: string,
  length: number,
  char = ' ',
  direction: PadDirection = 'end'
): string {
  if (value.length >= length) return value;
  const totalPad = length - value.length;
  if (direction === 'start') return value.padStart(length, char);
  if (direction === 'end') return value.padEnd(length, char);
  // both
  const padStart = Math.floor(totalPad / 2);
  const padEnd = totalPad - padStart;
  return char.repeat(padStart) + value + char.repeat(padEnd);
}

export function padEnv(
  env: Record<string, string>,
  options: PadOptions
): PadResult {
  const { length, char = ' ', direction = 'end', keys } = options;
  const padded: Record<string, string> = { ...env };
  const changed: string[] = [];

  const targetKeys = keys && keys.length > 0 ? keys : Object.keys(env);

  for (const key of targetKeys) {
    if (!(key in env)) continue;
    const original = env[key];
    const newValue = padValue(original, length, char, direction);
    if (newValue !== original) {
      padded[key] = newValue;
      changed.push(key);
    }
  }

  return { original: env, padded, changed };
}

export function formatPadResult(result: PadResult): string {
  if (result.changed.length === 0) {
    return 'No values needed padding.';
  }
  const lines = result.changed.map(
    (key) => `  ${key}: "${result.original[key]}" → "${result.padded[key]}"`
  );
  return `Padded ${result.changed.length} value(s):\n${lines.join('\n')}`;
}
