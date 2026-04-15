import { EnvRecord } from '../parser/envParser';
import { shouldRedact } from '../redact/secretRedactor';

export type MaskStrategy = 'full' | 'partial' | 'length';

export interface MaskOptions {
  strategy?: MaskStrategy;
  char?: string;
  visibleChars?: number;
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
  const { strategy = 'full', char = '*', visibleChars = 4 } = options;

  if (value.length === 0) return value;

  switch (strategy) {
    case 'full':
      return char.repeat(value.length);

    case 'partial': {
      if (value.length <= visibleChars) {
        return char.repeat(value.length);
      }
      const visible = value.slice(-visibleChars);
      return char.repeat(value.length - visibleChars) + visible;
    }

    case 'length':
      return `${char.repeat(8)} (${value.length} chars)`;

    default:
      return char.repeat(value.length);
  }
}

export function maskEnv(
  env: EnvRecord,
  options: MaskOptions = {},
  customKeys?: string[]
): MaskResult {
  const masked: EnvRecord = {};
  const maskedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldMask =
      (customKeys ? customKeys.includes(key) : false) || shouldRedact(key);

    if (shouldMask) {
      masked[key] = maskValue(value, options);
      maskedKeys.push(key);
    } else {
      masked[key] = value;
    }
  }

  return { original: env, masked, maskedKeys };
}

export function formatMaskResult(result: MaskResult): string {
  const lines: string[] = [];

  if (result.maskedKeys.length === 0) {
    lines.push('No keys were masked.');
  } else {
    lines.push(`Masked ${result.maskedKeys.length} key(s):`);
    for (const key of result.maskedKeys) {
      lines.push(`  ${key}: ${result.masked[key]}`);
    }
  }

  return lines.join('\n');
}
