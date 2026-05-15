export interface Mask19Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask19Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue19(
  value: string,
  options: Mask19Options = {}
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
  const maskLen = Math.max(1, value.length - visibleStart - visibleEnd);
  return start + char.repeat(maskLen) + end;
}

export function maskEnv19(
  env: Record<string, string>,
  keys: string[],
  options: Mask19Options = {}
): Mask19Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue19(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask19Result(result: Mask19Result): string {
  const lines: string[] = [];
  lines.push(`Masked ${result.maskedKeys.length} key(s)`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.masked[key]}`);
  }
  return lines.join('\n');
}
