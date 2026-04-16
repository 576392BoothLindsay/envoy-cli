export type LowercaseTarget = 'keys' | 'values' | 'both';

export interface LowercaseResult {
  original: Record<string, string>;
  transformed: Record<string, string>;
  changedKeys: string[];
}

export function lowercaseKeys(env: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key.toLowerCase()] = value;
  }
  return result;
}

export function lowercaseValues(env: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = value.toLowerCase();
  }
  return result;
}

export function applyLowercase(
  env: Record<string, string>,
  target: LowercaseTarget = 'keys'
): Record<string, string> {
  if (target === 'keys') return lowercaseKeys(env);
  if (target === 'values') return lowercaseValues(env);
  return lowercaseValues(lowercaseKeys(env));
}

export function formatLowercaseResult(result: LowercaseResult): string {
  const lines: string[] = [];
  lines.push(`Lowercased ${result.changedKeys.length} key(s).`);
  for (const key of result.changedKeys) {
    lines.push(`  ~ ${key}`);
  }
  return lines.join('\n');
}

export function getLowercaseResult(
  env: Record<string, string>,
  target: LowercaseTarget = 'keys'
): LowercaseResult {
  const transformed = applyLowercase(env, target);
  const originalKeys = Object.keys(env);
  const transformedKeys = Object.keys(transformed);
  const changedKeys = originalKeys.filter((k, i) => k !== transformedKeys[i]);
  return { original: env, transformed, changedKeys };
}
