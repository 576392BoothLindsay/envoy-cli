export interface Flatten2Result {
  original: Record<string, string>;
  flattened: Record<string, string>;
  separator: string;
  count: number;
}

export function flattenNestedJson(
  obj: unknown,
  prefix = "",
  separator = "_"
): Record<string, string> {
  const result: Record<string, string> = {};

  if (typeof obj !== "object" || obj === null) {
    result[prefix] = String(obj);
    return result;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenNestedJson(value, newKey, separator));
    } else {
      result[newKey] = Array.isArray(value) ? value.join(",") : String(value);
    }
  }

  return result;
}

export function flattenEnv2(
  env: Record<string, string>,
  separator = "_"
): Flatten2Result {
  const flattened: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        Object.assign(
          flattened,
          flattenNestedJson(parsed, key, separator)
        );
        continue;
      }
    } catch {
      // not JSON, keep as-is
    }
    flattened[key] = value;
  }

  return {
    original: env,
    flattened,
    separator,
    count: Object.keys(flattened).length,
  };
}

export function formatFlatten2Result(result: Flatten2Result): string {
  const lines: string[] = [];
  lines.push(`Separator: "${result.separator}"`);
  lines.push(
    `Keys: ${Object.keys(result.original).length} → ${result.count}`
  );
  for (const [key, value] of Object.entries(result.flattened)) {
    lines.push(`  ${key}=${value}`);
  }
  return lines.join("\n");
}
