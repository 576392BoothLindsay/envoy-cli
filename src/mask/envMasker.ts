import { EnvRecord } from '../parser/envParser';
import { shouldRedact } from '../redact/secretRedactor';

export interface MaskOptions {
  maskChar?: string;
  visibleChars?: number;
  keys?: string[];
}

export interface MaskResult {
  original: EnvRecord;
  masked: EnvRecord;
  maskedKeys: string[];
}

export function maskValue(value: string, maskChar = '*', visibleChars = 0): string {
  if (value.length === 0) return value;
  if (visibleChars <= 0) return maskChar.repeat(Math.min(value.length, 8));
  const visible = value.slice(-visibleChars);
  const hidden = maskChar.repeat(Math.max(value.length - visibleChars, 4));
  return hidden + visible;
}

export function maskEnv(
  env: EnvRecord,
  options: MaskOptions = {}
): MaskResult {
  const { maskChar = '*', visibleChars = 0, keys } = options;
  const masked: EnvRecord = {};
  const maskedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldMask = keys ? keys.includes(key) : shouldRedact(key);
    if (shouldMask) {
      masked[key] = maskValue(value, maskChar, visibleChars);
      maskedKeys.push(key);
    } else {
      masked[key] = value;
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMaskResult(result: MaskResult): string {
  const lines: string[] = [];
  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}=${result.masked[key]}`);
  }
  return lines.join('\n');
}
