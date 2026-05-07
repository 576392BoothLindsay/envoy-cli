export interface Mask7Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask7Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 0;
const DEFAULT_VISIBLE_END = 4;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue7(
  value: string,
  options: Mask7Options = {}
): string {
  const {
    char = DEFAULT_CHAR,
    visibleStart = DEFAULT_VISIBLE_START,
    visibleEnd = DEFAULT_VISIBLE_END,
    minLength = DEFAULT_MIN_LENGTH,
  } = options;

  if (value.length <= minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const maskLen = value.length - visibleStart - (visibleEnd > 0 ? visibleEnd : 0);
  const middle = char.repeat(Math.max(1, maskLen));

  return `${start}${middle}${end}`;
}

export function maskEnv7(
  env: Record<string, string>,
  keys: string[],
  options: Mask7Options = {}
): Mask7Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue7(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask7Result(result: Mask7Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (k) => `  ${k}: ${result.masked[k]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
