export interface Mask9Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask9Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue9(
  value: string,
  options: Mask9Options = {}
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
  return `${start}${char.repeat(maskLen)}${end}`;
}

export function maskEnv9(
  env: Record<string, string>,
  keys: string[],
  options: Mask9Options = {}
): Mask9Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue9(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask9Result(result: Mask9Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
