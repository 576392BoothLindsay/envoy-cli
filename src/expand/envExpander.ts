import { EnvRecord } from '../parser/envParser';

export interface ExpandResult {
  expanded: EnvRecord;
  expandedKeys: string[];
  skippedKeys: string[];
}

/**
 * Expands a single value by substituting ${VAR} or $VAR references
 * from the provided env record.
 */
export function expandValue(
  value: string,
  env: EnvRecord,
  visited: Set<string> = new Set()
): string {
  return value.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi, (match, braced, bare) => {
    const key = braced ?? bare;
    if (visited.has(key)) {
      // Circular reference — leave as-is
      return match;
    }
    if (key in env) {
      visited.add(key);
      const resolved = expandValue(env[key], env, new Set(visited));
      visited.delete(key);
      return resolved;
    }
    // Check process.env as fallback
    if (process.env[key] !== undefined) {
      return process.env[key] as string;
    }
    return match;
  });
}

/**
 * Expands all variable references across an entire EnvRecord.
 */
export function expandEnv(env: EnvRecord): ExpandResult {
  const expanded: EnvRecord = {};
  const expandedKeys: string[] = [];
  const skippedKeys: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const result = expandValue(value, env);
    expanded[key] = result;
    if (result !== value) {
      expandedKeys.push(key);
    } else {
      skippedKeys.push(key);
    }
  }

  return { expanded, expandedKeys, skippedKeys };
}

export function formatExpandResult(result: ExpandResult): string {
  const lines: string[] = [];
  if (result.expandedKeys.length > 0) {
    lines.push(`Expanded ${result.expandedKeys.length} key(s): ${result.expandedKeys.join(', ')}`);
  }
  if (result.skippedKeys.length > 0) {
    lines.push(`Unchanged ${result.skippedKeys.length} key(s).`);
  }
  if (result.expandedKeys.length === 0) {
    lines.push('No variables were expanded.');
  }
  return lines.join('\n');
}
