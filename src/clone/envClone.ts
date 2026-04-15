import { EnvRecord } from '../parser/envParser';

export interface CloneOptions {
  prefix?: string;
  stripPrefix?: string;
  overrides?: EnvRecord;
  exclude?: string[];
}

export interface CloneResult {
  original: EnvRecord;
  cloned: EnvRecord;
  addedKeys: string[];
  skippedKeys: string[];
}

export function cloneEnv(
  source: EnvRecord,
  options: CloneOptions = {}
): CloneResult {
  const { prefix = '', stripPrefix = '', overrides = {}, exclude = [] } = options;
  const cloned: EnvRecord = {};
  const addedKeys: string[] = [];
  const skippedKeys: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    if (exclude.includes(key)) {
      skippedKeys.push(key);
      continue;
    }

    let newKey = key;

    if (stripPrefix && key.startsWith(stripPrefix)) {
      newKey = key.slice(stripPrefix.length);
    }

    if (prefix) {
      newKey = `${prefix}${newKey}`;
    }

    cloned[newKey] = value;
    addedKeys.push(newKey);
  }

  for (const [key, value] of Object.entries(overrides)) {
    cloned[key] = value;
    if (!addedKeys.includes(key)) {
      addedKeys.push(key);
    }
  }

  return {
    original: source,
    cloned,
    addedKeys,
    skippedKeys,
  };
}

export function formatCloneResult(result: CloneResult): string {
  const lines: string[] = [];
  lines.push(`Cloned ${result.addedKeys.length} key(s) from source.`);
  if (result.skippedKeys.length > 0) {
    lines.push(`Skipped: ${result.skippedKeys.join(', ')}`);
  }
  return lines.join('\n');
}
