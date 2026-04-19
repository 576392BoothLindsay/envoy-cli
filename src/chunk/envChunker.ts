export interface ChunkResult {
  chunks: Record<string, string>[];
  total: number;
  chunkSize: number;
}

export function chunkEnv(
  env: Record<string, string>,
  size: number
): Record<string, string>[] {
  if (size <= 0) throw new Error('Chunk size must be greater than 0');
  const entries = Object.entries(env);
  const chunks: Record<string, string>[] = [];
  for (let i = 0; i < entries.length; i += size) {
    chunks.push(Object.fromEntries(entries.slice(i, i + size)));
  }
  return chunks;
}

export function chunkByPrefix(
  env: Record<string, string>
): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};
  for (const [key, value] of Object.entries(env)) {
    const prefix = key.includes('_') ? key.split('_')[0] : '__default';
    if (!groups[prefix]) groups[prefix] = {};
    groups[prefix][key] = value;
  }
  return groups;
}

export function formatChunkResult(result: ChunkResult): string {
  const lines: string[] = [
    `Chunked ${result.total} keys into ${result.chunks.length} chunk(s) of size ${result.chunkSize}:`,
  ];
  result.chunks.forEach((chunk, i) => {
    lines.push(`  Chunk ${i + 1}: ${Object.keys(chunk).join(', ')}`);
  });
  return lines.join('\n');
}
