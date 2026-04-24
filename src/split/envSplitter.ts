import { parseEnv, serializeEnv } from '../parser/envParser';

export interface SplitResult {
  chunks: Record<string, string>[];
  totalKeys: number;
  chunkCount: number;
}

export interface FormatSplitResult {
  output: string;
  summary: string;
}

/**
 * Split an env record into N roughly equal chunks.
 */
export function splitEnv(
  env: Record<string, string>,
  chunkSize: number
): SplitResult {
  if (chunkSize < 1) throw new Error('chunkSize must be >= 1');

  const entries = Object.entries(env);
  const chunks: Record<string, string>[] = [];

  for (let i = 0; i < entries.length; i += chunkSize) {
    const slice = entries.slice(i, i + chunkSize);
    chunks.push(Object.fromEntries(slice));
  }

  if (chunks.length === 0) chunks.push({});

  return {
    chunks,
    totalKeys: entries.length,
    chunkCount: chunks.length,
  };
}

/**
 * Split env by a delimiter found in values (e.g. comma-separated values).
 */
export function splitByDelimiter(
  env: Record<string, string>,
  delimiter: string
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = value.split(delimiter).map((v) => v.trim());
  }
  return result;
}

export function formatSplitResult(result: SplitResult): FormatSplitResult {
  const lines: string[] = [];

  result.chunks.forEach((chunk, index) => {
    lines.push(`# --- Chunk ${index + 1} ---`);
    lines.push(serializeEnv(chunk));
  });

  return {
    output: lines.join('\n'),
    summary: `Split ${result.totalKeys} keys into ${result.chunkCount} chunk(s) of up to ${Math.ceil(result.totalKeys / result.chunkCount)} keys each.`,
  };
}
