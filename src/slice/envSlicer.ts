import { EnvRecord } from '../parser/envParser';

export interface SliceResult {
  sliced: EnvRecord;
  total: number;
  start: number;
  end: number;
}

/**
 * Slice an env record by index range (start inclusive, end exclusive).
 */
export function sliceEnv(
  env: EnvRecord,
  start: number,
  end?: number
): SliceResult {
  const keys = Object.keys(env);
  const total = keys.length;
  const normalizedStart = Math.max(0, start < 0 ? total + start : start);
  const normalizedEnd =
    end === undefined
      ? total
      : end < 0
      ? Math.max(0, total + end)
      : Math.min(total, end);

  const slicedKeys = keys.slice(normalizedStart, normalizedEnd);
  const sliced: EnvRecord = {};
  for (const key of slicedKeys) {
    sliced[key] = env[key];
  }

  return {
    sliced,
    total,
    start: normalizedStart,
    end: normalizedEnd,
  };
}

/**
 * Slice env by a named range: first N, last N, or middle range.
 */
export function sliceByCount(
  env: EnvRecord,
  count: number,
  position: 'first' | 'last' = 'first'
): SliceResult {
  const total = Object.keys(env).length;
  if (position === 'last') {
    return sliceEnv(env, total - count);
  }
  return sliceEnv(env, 0, count);
}

export function formatSliceResult(result: SliceResult): string {
  const count = Object.keys(result.sliced).length;
  const lines: string[] = [
    `Sliced ${count} of ${result.total} keys (index ${result.start}–${result.end}):`,
  ];
  for (const [key, value] of Object.entries(result.sliced)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
