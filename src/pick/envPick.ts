import { EnvRecord } from '../parser/envParser';

export interface PickResult {
  picked: EnvRecord;
  missing: string[];
  count: number;
}

export function pickKeys(env: EnvRecord, keys: string[]): PickResult {
  const picked: EnvRecord = {};
  const missing: string[] = [];

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      picked[key] = env[key];
    } else {
      missing.push(key);
    }
  }

  return { picked, missing, count: Object.keys(picked).length };
}

export function pickByPattern(env: EnvRecord, pattern: RegExp): PickResult {
  const picked: EnvRecord = {};

  for (const [key, value] of Object.entries(env)) {
    if (pattern.test(key)) {
      picked[key] = value;
    }
  }

  return { picked, missing: [], count: Object.keys(picked).length };
}

export function formatPickResult(result: PickResult): string {
  const lines: string[] = [];
  lines.push(`Picked ${result.count} key(s).`);

  if (result.missing.length > 0) {
    lines.push(`Missing keys: ${result.missing.join(', ')}`);
  }

  for (const [key, value] of Object.entries(result.picked)) {
    lines.push(`  ${key}=${value}`);
  }

  return lines.join('\n');
}
