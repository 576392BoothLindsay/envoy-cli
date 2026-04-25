import { EnvRecord } from '../parser/envParser';

export interface MaskOptions {
  char?: string;
  visibleChars?: number;
  minLength?: number;
}

export interface MaskResult {
  original: EnvRecord;
  masked: EnvRecord;
  maskedKeys: string[];
}

const DEFAULT_MASK_CHAR = '*';
const DEFAULT_VISIBLE_CHARS = 2;
const DEFAULT_MIN_LENGTH = 4;

export function maskValue(
  value: string,
  options: MaskOptions = {}
): string {
  const char = options.char ?? DEFAULT_MASK_CHAR;
  const visibleChars = options.visibleChars ?? DEFAULT_VISIBLE_CHARS;
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;

  if (value.length < minLength) {
    return char.repeat(value.length);
  }

  const visible = Math.min(visibleChars, Math.floor(value.length / 2));
  const masked = char.repeat(value.length - visible);
  return masked + value.slice(value.length - visible);
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

  return {
    original: env,
    masked,
    maskedKeys,
  };
}

export function formatMaskResult(result: MaskResult): string {
  if (result.maskedKeys.length === 0) {
    return 'No keys masked.';
  }

  const lines: string[] = [`Masked ${result.maskedKeys.length} key(s):`, ''];

  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.masked[key]}`);
  }

  return lines.join('\n');
}
