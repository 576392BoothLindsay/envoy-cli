import { EnvRecord } from '../parser/envParser';

export interface SampleOptions {
  count?: number;
  seed?: number;
  keys?: string[];
}

export interface SampleResult {
  original: EnvRecord;
  sampled: EnvRecord;
  total: number;
  selected: number;
  skipped: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function sampleEnv(
  env: EnvRecord,
  options: SampleOptions = {}
): SampleResult {
  const keys = Object.keys(env);
  const total = keys.length;
  const count = Math.min(
    options.count !== undefined ? options.count : Math.ceil(total / 2),
    total
  );

  let selectedKeys: string[];

  if (options.keys && options.keys.length > 0) {
    selectedKeys = options.keys.filter((k) => k in env);
  } else if (options.seed !== undefined) {
    const rand = seededRandom(options.seed);
    const shuffled = [...keys].sort(() => rand() - 0.5);
    selectedKeys = shuffled.slice(0, count);
  } else {
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    selectedKeys = shuffled.slice(0, count);
  }

  const sampled: EnvRecord = {};
  for (const key of selectedKeys) {
    sampled[key] = env[key];
  }

  return {
    original: env,
    sampled,
    total,
    selected: selectedKeys.length,
    skipped: total - selectedKeys.length,
  };
}

export function formatSampleResult(result: SampleResult): string {
  const lines: string[] = [
    `Sampled ${result.selected} of ${result.total} keys (${result.skipped} skipped):`,
    '',
  ];
  for (const [key, value] of Object.entries(result.sampled)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join('\n');
}
