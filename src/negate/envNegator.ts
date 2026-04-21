import { EnvRecord } from '../parser/envParser';

export interface NegateResult {
  original: EnvRecord;
  negated: EnvRecord;
  negatedKeys: string[];
}

const TRUTHY_VALUES = new Set(['true', '1', 'yes', 'on', 'enabled']);
const FALSY_VALUES = new Set(['false', '0', 'no', 'off', 'disabled']);

/**
 * Negate a boolean-like value in a .env record.
 * Non-boolean values are left unchanged.
 */
export function negateValue(value: string): string {
  const lower = value.toLowerCase();
  if (TRUTHY_VALUES.has(lower)) return 'false';
  if (FALSY_VALUES.has(lower)) return 'true';
  return value;
}

/**
 * Negate all boolean-like values in an env record.
 * Optionally restrict to a specific set of keys.
 */
export function negateEnv(
  env: EnvRecord,
  keys?: string[]
): NegateResult {
  const negated: EnvRecord = { ...env };
  const negatedKeys: string[] = [];

  const targetKeys = keys ?? Object.keys(env);

  for (const key of targetKeys) {
    if (!(key in env)) continue;
    const original = env[key];
    const result = negateValue(original);
    if (result !== original) {
      negated[key] = result;
      negatedKeys.push(key);
    }
  }

  return { original: env, negated, negatedKeys };
}

export function formatNegateResult(result: NegateResult): string {
  if (result.negatedKeys.length === 0) {
    return 'No boolean-like keys found to negate.';
  }

  const lines = result.negatedKeys.map((key) => {
    const before = result.original[key];
    const after = result.negated[key];
    return `  ${key}: ${before} → ${after}`;
  });

  return `Negated ${result.negatedKeys.length} key(s):\n${lines.join('\n')}`;
}
