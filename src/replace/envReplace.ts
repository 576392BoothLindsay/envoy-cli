export interface ReplaceOptions {
  keys?: string[];
  pattern?: string;
  flags?: string;
}

export interface ReplaceResult {
  original: Record<string, string>;
  replaced: Record<string, string>;
  changedKeys: string[];
}

export function replaceInValue(
  value: string,
  search: string,
  replacement: string,
  flags = 'g'
): string {
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  return value.replace(regex, replacement);
}

export function replaceInEnv(
  env: Record<string, string>,
  search: string,
  replacement: string,
  options: ReplaceOptions = {}
): ReplaceResult {
  const { keys, pattern, flags = 'g' } = options;
  const replaced: Record<string, string> = { ...env };
  const changedKeys: string[] = [];

  const targetKeys = keys
    ? keys.filter((k) => k in env)
    : pattern
    ? Object.keys(env).filter((k) => new RegExp(pattern).test(k))
    : Object.keys(env);

  for (const key of targetKeys) {
    const newValue = replaceInValue(env[key], search, replacement, flags);
    if (newValue !== env[key]) {
      replaced[key] = newValue;
      changedKeys.push(key);
    }
  }

  return { original: env, replaced, changedKeys };
}

export function formatReplaceResult(result: ReplaceResult): string {
  if (result.changedKeys.length === 0) {
    return 'No values were changed.';
  }
  const lines = result.changedKeys.map(
    (k) => `  ${k}: "${result.original[k]}" → "${result.replaced[k]}"`
  );
  return `Replaced in ${result.changedKeys.length} key(s):\n${lines.join('\n')}`;
}
