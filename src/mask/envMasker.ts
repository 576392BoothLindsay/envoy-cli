import { EnvRecord } from '../parser/envParser';

export interface MaskOptions {
  char?: string;
  visibleStart?: number;
  visibleEnd?: number;
  minLength?: number;
}

export interface MaskResult {
  original: EnvRecord;
  masked: EnvRecord;
  maskedKeys: string[];
}

const DEFAULT_CHAR = '*';
const DEFAULT_VISIBLE_START = 0;
const DEFAULT_VISIBLE_END = 0;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue(value: string, options: MaskOptions = {}): string {
  const char = options.char ?? DEFAULT_CHAR;
  const visibleStart = options.visibleStart ?? DEFAULT_VISIBLE_START;
  const visibleEnd = options.visibleEnd ?? DEFAULT_VISIBLE_END;
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const start = value.slice(0, visibleStart);
  const end = visibleEnd > 0 ? value.slice(-visibleEnd) : '';
  const maskLen = value.length - visibleStart - (visibleEnd > 0 ? visibleEnd : 0);
  const middle = char.repeat(Math.max(maskLen, 1));

  return `${start}${middle}${end}`;
}

export function maskEnv(
  env: EnvRecord,
  keys: string[],
  options: MaskOptions = {}
): MaskResult {
  const masked: EnvRecord = { ...env };
  const maskedKeys: string[] = [];

  for (const key of keys) {
    if (key in env) {
      masked[key] = maskValue(env[key], options);
      maskedKeys.push(key);
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMaskResult(result: MaskResult): string {
  const lines: string[] = [];

  if (result.maskedKeys.length === 0) {
    lines.push('No keys were masked.');
    return lines.join('\n');
  }

  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.original[key]} → ${result.masked[key]}`);
  }

  return lines.join('\n');
}
