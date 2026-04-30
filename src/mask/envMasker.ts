import { EnvRecord } from '../parser/envParser';

export interface MaskOptions {
  char?: string;
  visibleChars?: number;
  keys?: string[];
}

export interface MaskResult {
  original: EnvRecord;
  masked: EnvRecord;
  maskedKeys: string[];
}

export function maskValue(value: string, char = '*', visibleChars = 0): string {
  if (value.length === 0) return value;
  if (visibleChars <= 0) return char.repeat(value.length);
  const visible = value.slice(-visibleChars);
  const hidden = char.repeat(Math.max(0, value.length - visibleChars));
  return hidden + visible;
}

export function maskEnv(
  env: EnvRecord,
  options: MaskOptions = {}
): MaskResult {
  const { char = '*', visibleChars = 0, keys } = options;
  const masked: EnvRecord = {};
  const maskedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldMask = keys ? keys.includes(key) : true;
    if (shouldMask) {
      masked[key] = maskValue(value, char, visibleChars);
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
  for (const [key, value] of Object.entries(result.masked)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
