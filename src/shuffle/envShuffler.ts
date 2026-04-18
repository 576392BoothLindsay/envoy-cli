import { EnvRecord } from '../parser/envParser';

export interface ShuffleResult {
  original: EnvRecord;
  shuffled: EnvRecord;
  count: number;
}

/**
 * Shuffle the order of keys in an env record using Fisher-Yates.
 */
export function shuffleEnv(env: EnvRecord, seed?: number): EnvRecord {
  const entries = Object.entries(env);
  const arr = [...entries];

  // Simple seeded shuffle if seed provided, else Math.random
  let rand = seed !== undefined ? seededRandom(seed) : Math.random.bind(Math);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return Object.fromEntries(arr);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function formatShuffleResult(result: ShuffleResult): string {
  const lines: string[] = [
    `Shuffled ${result.count} key(s):`,
    '',
    'New order:',
    ...Object.keys(result.shuffled).map((k, i) => `  ${i + 1}. ${k}`),
  ];
  return lines.join('\n');
}
