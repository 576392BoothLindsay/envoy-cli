/**
 * Transforms environment variable keys or values using built-in strategies.
 */

export type TransformStrategy = 'uppercase' | 'lowercase' | 'prefix' | 'suffix' | 'trim';

export interface TransformOptions {
  strategy: TransformStrategy;
  prefix?: string;
  suffix?: string;
  targetKeys?: string[];
}

export interface TransformResult {
  original: Record<string, string>;
  transformed: Record<string, string>;
  changedKeys: string[];
}

export function transformKeys(
  env: Record<string, string>,
  options: TransformOptions
): TransformResult {
  const transformed: Record<string, string> = {};
  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldTransform = !options.targetKeys || options.targetKeys.includes(key);
    let newKey = key;

    if (shouldTransform) {
      newKey = applyKeyStrategy(key, options);
      if (newKey !== key) {
        changedKeys.push(key);
      }
    }

    transformed[newKey] = value;
  }

  return { original: env, transformed, changedKeys };
}

export function transformValues(
  env: Record<string, string>,
  options: TransformOptions
): TransformResult {
  const transformed: Record<string, string> = { ...env };
  const changedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldTransform = !options.targetKeys || options.targetKeys.includes(key);
    if (!shouldTransform) continue;

    const newValue = applyValueStrategy(value, options);
    if (newValue !== value) {
      changedKeys.push(key);
    }
    transformed[key] = newValue;
  }

  return { original: env, transformed, changedKeys };
}

function applyKeyStrategy(key: string, options: TransformOptions): string {
  switch (options.strategy) {
    case 'uppercase': return key.toUpperCase();
    case 'lowercase': return key.toLowerCase();
    case 'prefix': return `${options.prefix ?? ''}${key}`;
    case 'suffix': return `${key}${options.suffix ?? ''}`;
    case 'trim': return key.trim();
    default: return key;
  }
}

function applyValueStrategy(value: string, options: TransformOptions): string {
  switch (options.strategy) {
    case 'uppercase': return value.toUpperCase();
    case 'lowercase': return value.toLowerCase();
    case 'prefix': return `${options.prefix ?? ''}${value}`;
    case 'suffix': return `${value}${options.suffix ?? ''}`;
    case 'trim': return value.trim();
    default: return value;
  }
}

export function formatTransformResult(result: TransformResult): string {
  if (result.changedKeys.length === 0) {
    return 'No changes applied.';
  }
  const lines = [`Transformed ${result.changedKeys.length} key(s):`, ''];
  for (const key of result.changedKeys) {
    lines.push(`  ${key}`);
  }
  return lines.join('\n');
}
