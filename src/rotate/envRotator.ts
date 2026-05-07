import { EnvRecord } from '../parser/envParser';

export interface RotateResult {
  original: EnvRecord;
  rotated: EnvRecord;
  rotatedKeys: string[];
  skippedKeys: string[];
}

export type RotateStrategy = 'shift' | 'cycle' | 'reverse';

/**
 * Rotates values among the specified keys using the given strategy.
 */
export function rotateValues(
  env: EnvRecord,
  keys: string[],
  strategy: RotateStrategy = 'shift'
): EnvRecord {
  const existingKeys = keys.filter((k) => k in env);
  if (existingKeys.length < 2) return { ...env };

  const values = existingKeys.map((k) => env[k]);
  let rotatedValues: string[];

  switch (strategy) {
    case 'shift':
      rotatedValues = [values[values.length - 1], ...values.slice(0, -1)];
      break;
    case 'cycle':
      rotatedValues = [...values.slice(1), values[0]];
      break;
    case 'reverse':
      rotatedValues = [...values].reverse();
      break;
    default:
      rotatedValues = values;
  }

  const result: EnvRecord = { ...env };
  existingKeys.forEach((key, idx) => {
    result[key] = rotatedValues[idx];
  });

  return result;
}

export function rotateEnv(
  env: EnvRecord,
  keys: string[],
  strategy: RotateStrategy = 'shift'
): RotateResult {
  const rotatedKeys = keys.filter((k) => k in env);
  const skippedKeys = keys.filter((k) => !(k in env));
  const rotated = rotateValues(env, keys, strategy);

  return {
    original: env,
    rotated,
    rotatedKeys,
    skippedKeys,
  };
}

export function formatRotateResult(result: RotateResult): string {
  const lines: string[] = [];

  if (result.rotatedKeys.length === 0) {
    lines.push('No keys rotated.');
    return lines.join('\n');
  }

  lines.push(`Rotated ${result.rotatedKeys.length} key(s):`);
  result.rotatedKeys.forEach((key) => {
    const before = result.original[key];
    const after = result.rotated[key];
    lines.push(`  ${key}: ${before} → ${after}`);
  });

  if (result.skippedKeys.length > 0) {
    lines.push(`Skipped (not found): ${result.skippedKeys.join(', ')}`);
  }

  return lines.join('\n');
}
