export interface Mask13Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask13Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue13(
  value: string,
  options: Mask13Options = {}
): string {
  const char = options.char ?? DEFAULT_CHAR;
  const visibleStart = options.visibleStart ?? DEFAULT_VISIBLE_START;
  const visibleEnd = options.visibleEnd ?? DEFAULT_VISIBLE_END;
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const middleLength = Math.max(1, value.length - visibleStart - visibleEnd);
  const middle = char.repeat(middleLength);

  return `${start}${middle}${end}`;
}

export function maskEnv13(
  env: Record<string, string>,
  keys: string[],
  options: Mask13Options = {}
): Mask13Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue13(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask13Result(result: Mask13Result): string {
  const lines: string[] = [];
  for (const key of result.maskedKeys) {
    lines.push(`${key}: ${result.original[key]} → ${result.masked[key]}`);
  }
  return lines.length > 0
    ? `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`
    : 'No keys masked.';
}
