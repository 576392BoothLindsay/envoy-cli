import { parseEnv } from '../parser/envParser';

export interface Mask6Options {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface Mask6Result {
  original: Record<string, string>;
  masked: Record<string, string>;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 2;
const DEFAULT_VISIBLE_END = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue6(
  value: string,
  options: Mask6Options = {}
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
  const middle = char.repeat(Math.max(1, value.length - visibleStart - visibleEnd));

  return `${start}${middle}${end}`;
}

export function maskEnv6(
  env: Record<string, string>,
  keys: string[],
  options: Mask6Options = {}
): Mask6Result {
  const masked: Record<string, string> = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue6(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMask6Result(result: Mask6Result): string {
  const lines: string[] = [];

  if (result.maskedKeys.length === 0) {
    lines.push('No keys were masked.');
    return lines.join('\n');
  }

  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}=${result.masked[key]}`);
  }

  return lines.join('\n');
}
