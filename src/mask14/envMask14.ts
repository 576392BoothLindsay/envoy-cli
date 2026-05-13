export interface Mask14Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask14Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 6;

export function maskValue14(
  value: string,
  options: Mask14Options = {}
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
  const maskLength = value.length - visibleStart - visibleEnd;
  const middle = char.repeat(Math.max(maskLength, 1));

  return `${start}${middle}${end}`;
}

export function maskEnv14(
  env: Record<string, string>,
  keys: string[],
  options: Mask14Options = {}
): Mask14Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue14(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask14Result(result: Mask14Result): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }
  const lines = result.maskedKeys.map(
    (key) => `  ${key}: ${result.masked[key]}`
  );
  return `Masked ${result.maskedKeys.length} key(s):\n${lines.join('\n')}`;
}
