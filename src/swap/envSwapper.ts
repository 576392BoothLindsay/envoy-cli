export interface SwapResult {
  swapped: Record<string, string>;
  pairs: Array<{ keyA: string; keyB: string }>;
  unchanged: Record<string, string>;
}

export function swapValues(
  env: Record<string, string>,
  keyA: string,
  keyB: string
): Record<string, string> {
  if (!(keyA in env) || !(keyB in env)) {
    throw new Error(`Both keys must exist: "${keyA}", "${keyB}"`);
  }
  const result = { ...env };
  const tmp = result[keyA];
  result[keyA] = result[keyB];
  result[keyB] = tmp;
  return result;
}

export function swapMultiple(
  env: Record<string, string>,
  pairs: Array<[string, string]>
): SwapResult {
  let result = { ...env };
  const swappedPairs: Array<{ keyA: string; keyB: string }> = [];
  const unchanged = { ...env };

  for (const [keyA, keyB] of pairs) {
    if (keyA in result && keyB in result) {
      result = swapValues(result, keyA, keyB);
      swappedPairs.push({ keyA, keyB });
      delete unchanged[keyA];
      delete unchanged[keyB];
    }
  }

  return { swapped: result, pairs: swappedPairs, unchanged };
}

export function formatSwapResult(result: SwapResult): string {
  const lines: string[] = [];
  if (result.pairs.length === 0) {
    lines.push('No keys were swapped.');
    return lines.join('\n');
  }
  lines.push(`Swapped ${result.pairs.length} pair(s):`);
  for (const { keyA, keyB } of result.pairs) {
    lines.push(`  ${keyA} <-> ${keyB}`);
  }
  return lines.join('\n');
}
