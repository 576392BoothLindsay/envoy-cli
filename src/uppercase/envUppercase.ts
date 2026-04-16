export interface UppercaseResult {
  original: Record<string, string>;
  result: Record<string, string>;
  changed: string[];
}

export function uppercaseKeys(env: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key.toUpperCase()] = value;
  }
  return result;
}

export function uppercaseValues(env: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = value.toUpperCase();
  }
  return result;
}

export function applyUppercase(
  env: Record<string, string>,
  target: 'keys' | 'values' | 'both'
): UppercaseResult {
  const original = { ...env };
  let result = { ...env };

  if (target === 'keys' || target === 'both') {
    result = uppercaseKeys(result);
  }
  if (target === 'values' || target === 'both') {
    result = uppercaseValues(result);
  }

  const changed = Object.keys(original).filter(
    (k) => {
      const newKey = (target === 'keys' || target === 'both') ? k.toUpperCase() : k;
      const newVal = (target === 'values' || target === 'both') ? original[k].toUpperCase() : original[k];
      return k !== newKey || original[k] !== newVal;
    }
  );

  return { original, result, changed };
}

export function formatUppercaseResult(res: UppercaseResult): string {
  if (res.changed.length === 0) return 'No changes made.';
  const lines = [`Uppercased ${res.changed.length} entr${res.changed.length === 1 ? 'y' : 'ies'}.`];
  for (const key of res.changed) {
    lines.push(`  ${key}`);
  }
  return lines.join('\n');
}
