export type InheritRecord = Record<string, string>;

export interface InheritResult {
  base: InheritRecord;
  override: InheritRecord;
  merged: InheritRecord;
  inherited: string[];
  overridden: string[];
  added: string[];
}

/**
 * Merge override into base, tracking what was inherited, overridden, or added.
 */
export function inheritEnv(
  base: InheritRecord,
  override: InheritRecord
): InheritResult {
  const merged: InheritRecord = { ...base };
  const inherited: string[] = [];
  const overridden: string[] = [];
  const added: string[] = [];

  for (const [key, value] of Object.entries(override)) {
    if (key in base) {
      if (base[key] !== value) {
        overridden.push(key);
      } else {
        inherited.push(key);
      }
    } else {
      added.push(key);
    }
    merged[key] = value;
  }

  for (const key of Object.keys(base)) {
    if (!(key in override)) {
      inherited.push(key);
    }
  }

  return { base, override, merged, inherited, overridden, added };
}

export function formatInheritResult(result: InheritResult): string {
  const lines: string[] = [];
  if (result.inherited.length)
    lines.push(`Inherited (${result.inherited.length}): ${result.inherited.join(', ')}`);
  if (result.overridden.length)
    lines.push(`Overridden (${result.overridden.length}): ${result.overridden.join(', ')}`);
  if (result.added.length)
    lines.push(`Added (${result.added.length}): ${result.added.join(', ')}`);
  return lines.join('\n');
}
