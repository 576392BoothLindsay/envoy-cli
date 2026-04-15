export type ScopeRecord = Record<string, Record<string, string>>;

export interface ScopeResult {
  scope: string;
  keys: string[];
  env: Record<string, string>;
}

export interface ExtractScopeResult {
  scopes: ScopeResult[];
  unscoped: Record<string, string>;
}

/**
 * Extracts keys from an env record that belong to a given scope prefix.
 * e.g. scope "DB" matches keys like DB_HOST, DB_PORT
 */
export function extractScope(
  env: Record<string, string>,
  scope: string
): ScopeResult {
  const prefix = scope.toUpperCase() + "_";
  const scoped: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (key.toUpperCase().startsWith(prefix)) {
      scoped[key] = value;
    }
  }

  return {
    scope,
    keys: Object.keys(scoped),
    env: scoped,
  };
}

/**
 * Splits an env record into named scopes based on key prefixes.
 * Keys that don't match any scope go into `unscoped`.
 */
export function splitByScopes(
  env: Record<string, string>,
  scopes: string[]
): ExtractScopeResult {
  const upperScopes = scopes.map((s) => s.toUpperCase());
  const usedKeys = new Set<string>();
  const results: ScopeResult[] = [];

  for (const scope of upperScopes) {
    const result = extractScope(env, scope);
    result.keys.forEach((k) => usedKeys.add(k));
    results.push(result);
  }

  const unscoped: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (!usedKeys.has(key)) {
      unscoped[key] = value;
    }
  }

  return { scopes: results, unscoped };
}

/**
 * Merges a scoped env record back into a flat env, optionally renaming the prefix.
 */
export function flattenScope(
  scopeResult: ScopeResult,
  newPrefix?: string
): Record<string, string> {
  if (!newPrefix) return { ...scopeResult.env };

  const oldPrefix = scopeResult.scope.toUpperCase() + "_";
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(scopeResult.env)) {
    const newKey = newPrefix.toUpperCase() + "_" + key.slice(oldPrefix.length);
    result[newKey] = value;
  }

  return result;
}

/**
 * Formats a scope split result for display.
 */
export function formatScopeResult(result: ExtractScopeResult): string {
  const lines: string[] = [];

  for (const scope of result.scopes) {
    lines.push(`[${scope.scope}] (${scope.keys.length} keys)`);
    for (const key of scope.keys) {
      lines.push(`  ${key}=${scope.env[key]}`);
    }
  }

  const unscopedKeys = Object.keys(result.unscoped);
  if (unscopedKeys.length > 0) {
    lines.push(`[unscoped] (${unscopedKeys.length} keys)`);
    for (const key of unscopedKeys) {
      lines.push(`  ${key}=${result.unscoped[key]}`);
    }
  }

  return lines.join("\n");
}
