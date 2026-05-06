/**
 * envSqueezer.ts
 * Removes empty/blank entries and collapses repeated blank lines from env records.
 */

export interface SqueezeResult {
  original: Record<string, string>;
  squeezed: Record<string, string>;
  removedKeys: string[];
  removedCount: number;
}

/**
 * Returns true if the value is empty or whitespace-only.
 */
export function isBlankValue(value: string): boolean {
  return value.trim() === "";
}

/**
 * Removes all keys whose values are empty or whitespace-only.
 */
export function squeezeEnv(
  env: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!isBlankValue(value)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Returns the keys that would be removed by squeezing.
 */
export function getBlankKeys(env: Record<string, string>): string[] {
  return Object.keys(env).filter((key) => isBlankValue(env[key]));
}

/**
 * Builds a full SqueezeResult with metadata.
 */
export function buildSqueezeResult(
  original: Record<string, string>
): SqueezeResult {
  const removedKeys = getBlankKeys(original);
  const squeezed = squeezeEnv(original);
  return {
    original,
    squeezed,
    removedKeys,
    removedCount: removedKeys.length,
  };
}

/**
 * Formats a SqueezeResult as a human-readable string.
 */
export function formatSqueezeResult(result: SqueezeResult): string {
  const lines: string[] = [];
  if (result.removedCount === 0) {
    lines.push("No blank entries found.");
  } else {
    lines.push(
      `Removed ${result.removedCount} blank entr${
        result.removedCount === 1 ? "y" : "ies"
      }:`
    );
    for (const key of result.removedKeys) {
      lines.push(`  - ${key}`);
    }
  }
  lines.push(`Remaining keys: ${Object.keys(result.squeezed).length}`);
  return lines.join("\n");
}
