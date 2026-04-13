/**
 * envMerge.ts
 * Provides utilities for merging multiple .env files with conflict resolution strategies.
 */

export type MergeStrategy = 'ours' | 'theirs' | 'prompt' | 'error';

export interface MergeConflict {
  key: string;
  baseValue: string | undefined;
  oursValue: string | undefined;
  theirsValue: string | undefined;
}

export interface MergeResult {
  merged: Record<string, string>;
  conflicts: MergeConflict[];
  addedKeys: string[];
  removedKeys: string[];
  overriddenKeys: string[];
}

/**
 * Merges two env records using the provided strategy for conflict resolution.
 */
export function mergeEnvRecords(
  base: Record<string, string>,
  theirs: Record<string, string>,
  strategy: MergeStrategy = 'ours'
): MergeResult {
  const merged: Record<string, string> = { ...base };
  const conflicts: MergeConflict[] = [];
  const addedKeys: string[] = [];
  const removedKeys: string[] = [];
  const overriddenKeys: string[] = [];

  const allKeys = new Set([...Object.keys(base), ...Object.keys(theirs)]);

  for (const key of allKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, key);
    const inTheirs = Object.prototype.hasOwnProperty.call(theirs, key);

    if (inBase && !inTheirs) {
      // Key only in base — keep it, note removal from theirs perspective
      removedKeys.push(key);
    } else if (!inBase && inTheirs) {
      // Key only in theirs — add it
      merged[key] = theirs[key];
      addedKeys.push(key);
    } else if (base[key] !== theirs[key]) {
      // Conflict: both have the key but values differ
      conflicts.push({
        key,
        baseValue: base[key],
        oursValue: base[key],
        theirsValue: theirs[key],
      });

      if (strategy === 'theirs') {
        merged[key] = theirs[key];
        overriddenKeys.push(key);
      } else if (strategy === 'error') {
        throw new Error(
          `Merge conflict on key "${key}": base="${base[key]}", theirs="${theirs[key]}"`
        );
      }
      // 'ours' and 'prompt' keep the base value (prompt resolution is external)
    }
  }

  return { merged, conflicts, addedKeys, removedKeys, overriddenKeys };
}

/**
 * Merges multiple env records in order, applying the same strategy throughout.
 */
export function mergeMultipleEnvs(
  envs: Record<string, string>[],
  strategy: MergeStrategy = 'ours'
): MergeResult {
  if (envs.length === 0) return { merged: {}, conflicts: [], addedKeys: [], removedKeys: [], overriddenKeys: [] };
  if (envs.length === 1) return { merged: { ...envs[0] }, conflicts: [], addedKeys: [], removedKeys: [], overriddenKeys: [] };

  let result = mergeEnvRecords(envs[0], envs[1], strategy);

  for (let i = 2; i < envs.length; i++) {
    const next = mergeEnvRecords(result.merged, envs[i], strategy);
    result = {
      merged: next.merged,
      conflicts: [...result.conflicts, ...next.conflicts],
      addedKeys: [...result.addedKeys, ...next.addedKeys],
      removedKeys: [...result.removedKeys, ...next.removedKeys],
      overriddenKeys: [...result.overriddenKeys, ...next.overriddenKeys],
    };
  }

  return result;
}
