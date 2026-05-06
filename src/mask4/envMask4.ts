import { parseEnv } from '../parser/envParser';

export interface Mask4Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask4Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue4(
  value: string,
  options: Mask4Options = {}
): string {
  const char = options.char ?? DEFAULT_CHAR;
  const visibleStart = options.visibleStart ?? DEFAULT_VISIBLE_START;
  const visibleEnd = options.visibleEnd ?? DEFAULT_VISIBLE_END;
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;

  if (value.length <= minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const middleLen = Math.max(1, value.length - visibleStart - visibleEnd);
  const middle = char.repeat(middleLen);

  return `${start}${middle}${end}`;
}

export function maskEnv4(
  env: Record<string, string>,
  keys: string[],
  options: Mask4Options = {}
): Mask4Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue4(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask4Result(result: Mask4Result): string {
  const lines: string[] = [];
  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.original[key]} → ${result.masked[key]}`);
  }
  return lines.join('\n');
}
