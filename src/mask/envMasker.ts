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

export function maskValue(
  value: string,
  options: MaskOptions = {}
): string {
  const { char = '*', visibleChars = 0, minLength = 3 } = options;
  if (value.length < minLength) {
    return char.repeat(value.length);
  }
  if (visibleChars > 0 && value.length > visibleChars) {
    const visible = value.slice(-visibleChars);
    const masked = char.repeat(value.length - visibleChars);
    return masked + visible;
  }
  return char.repeat(value.length);
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
  lines.push(`Masked ${result.maskedKeys.length} key(s):`);
  for (const key of result.maskedKeys) {
    lines.push(`  ${key}: ${result.original[key]} → ${result.masked[key]}`);
  }
  if (result.maskedKeys.length === 0) {
    lines.push('  (no keys matched)');
  }
  return lines.join('\n');
}
