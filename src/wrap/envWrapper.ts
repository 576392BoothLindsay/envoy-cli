export interface WrapOptions {
  prefix?: string;
  suffix?: string;
  quote?: 'single' | 'double' | 'none';
}

export interface WrapResult {
  original: Record<string, string>;
  wrapped: Record<string, string>;
  changed: string[];
}

export function wrapValue(value: string, options: WrapOptions): string {
  let result = value;

  if (options.quote === 'single') {
    result = `'${result}'`;
  } else if (options.quote === 'double') {
    result = `"${result}"`;
  }

  if (options.prefix) result = `${options.prefix}${result}`;
  if (options.suffix) result = `${result}${options.suffix}`;

  return result;
}

export function wrapEnv(
  env: Record<string, string>,
  keys: string[],
  options: WrapOptions
): WrapResult {
  const wrapped: Record<string, string> = { ...env };
  const changed: string[] = [];

  for (const key of keys) {
    if (key in env) {
      const newValue = wrapValue(env[key], options);
      if (newValue !== env[key]) {
        wrapped[key] = newValue;
        changed.push(key);
      }
    }
  }

  return { original: env, wrapped, changed };
}

export function formatWrapResult(result: WrapResult): string {
  if (result.changed.length === 0) {
    return 'No values were wrapped.';
  }
  const lines = [`Wrapped ${result.changed.length} value(s):`, ''];
  for (const key of result.changed) {
    lines.push(`  ${key}: ${result.original[key]} → ${result.wrapped[key]}`);
  }
  return lines.join('\n');
}
