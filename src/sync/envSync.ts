import { EnvMap } from '../parser/envParser';
import { diffEnv, EnvDiff } from '../diff/envDiff';

export interface SyncOptions {
  overwrite?: boolean;
  addMissing?: boolean;
  removeExtra?: boolean;
}

export interface SyncResult {
  synced: EnvMap;
  added: string[];
  updated: string[];
  removed: string[];
  skipped: string[];
}

/**
 * Syncs a source env map into a target env map.
 * Returns a new map with the sync applied along with a summary.
 */
export function syncEnv(
  source: EnvMap,
  target: EnvMap,
  options: SyncOptions = {}
): SyncResult {
  const { overwrite = true, addMissing = true, removeExtra = false } = options;

  const diff: EnvDiff = diffEnv(source, target);
  const synced: EnvMap = { ...target };

  const added: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];
  const skipped: string[] = [];

  // Add keys present in source but missing in target
  for (const key of diff.added) {
    if (addMissing) {
      synced[key] = source[key];
      added.push(key);
    } else {
      skipped.push(key);
    }
  }

  // Update keys that differ between source and target
  for (const key of diff.changed) {
    if (overwrite) {
      synced[key] = source[key];
      updated.push(key);
    } else {
      skipped.push(key);
    }
  }

  // Remove keys present in target but not in source
  for (const key of diff.removed) {
    if (removeExtra) {
      delete synced[key];
      removed.push(key);
    } else {
      skipped.push(key);
    }
  }

  return { synced, added, updated, removed, skipped };
}

/**
 * Merges multiple env maps in order (later maps take precedence).
 */
export function mergeEnvs(...envMaps: EnvMap[]): EnvMap {
  return Object.assign({}, ...envMaps);
}
