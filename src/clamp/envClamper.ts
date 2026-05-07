import { parseEnv } from '../parser/envParser';

export interface ClampOptions {
  min?: number;
  max?: number;
  keys?: string[];
}

export interface ClampResult {
  original: Record<string, string>;
  clamped: Record<string, string>;
  changed: string[];
}

export function clampValue(value: string, min?: number, max?: number): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  let result = num;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;

  return result === num ? value : String(result);
}

export function clampEnv(
  env: Record<string, string>,
  options: ClampOptions = {}
): ClampResult {
  const { min, max, keys } = options;
  const clamped: Record<string, string> = { ...env };
  const changed: string[] = [];

  for (const key of Object.keys(env)) {
    if (keys && !keys.includes(key)) continue;

    const original = env[key];
    const updated = clampValue(original, min, max);

    if (updated !== original) {
      clamped[key] = updated;
      changed.push(key);
    }
  }

  return { original: env, clamped, changed };
}

export function formatClampResult(result: ClampResult): string {
  if (result.changed.length === 0) {
    return 'No values were clamped.';
  }

  const lines = result.changed.map(
    (key) => `  ${key}: ${result.original[key]} → ${result.clamped[key]}`
  );

  return `Clamped ${result.changed.length} value(s):\n${lines.join('\n')}`;
}
