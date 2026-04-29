export type CaseStrategy = 'camel' | 'snake' | 'pascal' | 'kebab' | 'constant';

export interface RecaseResult {
  original: Record<string, string>;
  recased: Record<string, string>;
  changed: string[];
}

export function toSnakeCase(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toUpperCase();
}

export function toCamelCase(key: string): string {
  return key
    .toLowerCase()
    .replace(/[_\-\s]+(.)/g, (_, c) => c.toUpperCase());
}

export function toPascalCase(key: string): string {
  const camel = toCamelCase(key);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function toKebabCase(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

export function toConstantCase(key: string): string {
  return toSnakeCase(key).toUpperCase();
}

export function recaseKey(key: string, strategy: CaseStrategy): string {
  switch (strategy) {
    case 'camel': return toCamelCase(key);
    case 'snake': return toSnakeCase(key);
    case 'pascal': return toPascalCase(key);
    case 'kebab': return toKebabCase(key);
    case 'constant': return toConstantCase(key);
    default: return key;
  }
}

export function recaseEnv(
  env: Record<string, string>,
  strategy: CaseStrategy
): RecaseResult {
  const recased: Record<string, string> = {};
  const changed: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const newKey = recaseKey(key, strategy);
    recased[newKey] = value;
    if (newKey !== key) changed.push(key);
  }

  return { original: env, recased, changed };
}

export function formatRecaseResult(result: RecaseResult): string {
  const lines: string[] = [];
  lines.push(`Recased ${result.changed.length} key(s).`);
  for (const key of result.changed) {
    const newKey = Object.keys(result.recased).find(
      (k) => result.recased[k] === result.original[key] || true
    );
    lines.push(`  ${key} → (recased)`);
  }
  return lines.join('\n');
}
