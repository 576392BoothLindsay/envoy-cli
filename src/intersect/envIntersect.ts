import { EnvRecord } from '../parser/envParser';

export interface IntersectResult {
  intersection: EnvRecord;
  commonKeys: string[];
  totalKeys: number;
}

/**
 * Returns keys and values that exist in ALL provided env records with identical values.
 */
export function intersectEnvs(
  envs: EnvRecord[],
  matchValues = true
): IntersectResult {
  if (envs.length === 0) {
    return { intersection: {}, commonKeys: [], totalKeys: 0 };
  }

  const [first, ...rest] = envs;
  const intersection: EnvRecord = {};

  for (const key of Object.keys(first)) {
    const value = first[key];
    const inAll = rest.every((env) =>
      matchValues ? env[key] === value : key in env
    );
    if (inAll) {
      intersection[key] = value;
    }
  }

  return {
    intersection,
    commonKeys: Object.keys(intersection),
    totalKeys: Object.keys(intersection).length,
  };
}

export function formatIntersectResult(result: IntersectResult): string {
  if (result.totalKeys === 0) {
    return 'No common keys found.';
  }
  const lines = [`Common keys (${result.totalKeys}):`, ''];
  for (const key of result.commonKeys) {
    lines.push(`  ${key}=${result.intersection[key]}`);
  }
  return lines.join('\n');
}
