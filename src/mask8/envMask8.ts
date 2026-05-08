export interface Mask8Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask8Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue8(
  value: string,
  options: Mask8Options = {}
): string {
  const {
    char = DEFAULT_CHAR,
    visibleStart = DEFAULT_VISIBLE_START,
    visibleEnd = DEFAULT_VISIBLE_END,
    minLength = DEFAULT_MIN_LENGTH,
  } = options;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const maskLen = Math.max(1, value.length - visibleStart - visibleEnd);
  return `${start}${char.repeat(maskLen)}${end}`;
}

export function maskEnv8(
  env: Record<string, string>,
  keys: string[],
  options: Mask8Options = {}
): Mask8Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue8(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask8Result(result: Mask8Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
