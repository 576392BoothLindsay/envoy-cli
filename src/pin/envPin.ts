import { EnvRecord } from '../parser/envParser';

export interface PinnedKey {
  key: string;
  value: string;
  pinnedAt: string;
  environment?: string;
}

export interface PinStore {
  pins: PinnedKey[];
}

export interface PinResult {
  pinned: string[];
  unpinned: string[];
  conflicts: string[];
}

export function pinKeys(
  env: EnvRecord,
  keys: string[],
  environment?: string
): { store: PinStore; result: PinResult } {
  const store: PinStore = { pins: [] };
  const result: PinResult = { pinned: [], unpinned: [], conflicts: [] };

  for (const key of keys) {
    if (!(key in env)) {
      result.conflicts.push(key);
      continue;
    }
    store.pins.push({
      key,
      value: env[key],
      pinnedAt: new Date().toISOString(),
      environment,
    });
    result.pinned.push(key);
  }

  return { store, result };
}

export function applyPins(env: EnvRecord, store: PinStore): EnvRecord {
  const result: EnvRecord = { ...env };
  for (const pin of store.pins) {
    result[pin.key] = pin.value;
  }
  return result;
}

export function removePins(store: PinStore, keys: string[]): { store: PinStore; result: PinResult } {
  const result: PinResult = { pinned: [], unpinned: [], conflicts: [] };
  const remaining = store.pins.filter((pin) => {
    if (keys.includes(pin.key)) {
      result.unpinned.push(pin.key);
      return false;
    }
    return true;
  });

  const notFound = keys.filter((k) => !store.pins.some((p) => p.key === k));
  result.conflicts.push(...notFound);

  return { store: { pins: remaining }, result };
}

export function formatPinResult(result: PinResult): string {
  const lines: string[] = [];
  if (result.pinned.length > 0) {
    lines.push(`Pinned: ${result.pinned.join(', ')}`);
  }
  if (result.unpinned.length > 0) {
    lines.push(`Unpinned: ${result.unpinned.join(', ')}`);
  }
  if (result.conflicts.length > 0) {
    lines.push(`Not found: ${result.conflicts.join(', ')}`);
  }
  return lines.join('\n');
}
