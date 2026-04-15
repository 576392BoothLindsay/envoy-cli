import * as fs from 'fs';
import * as path from 'path';
import { EnvRecord } from '../parser/envParser';
import { redactEnv } from '../redact/secretRedactor';

export interface Snapshot {
  id: string;
  label?: string;
  timestamp: string;
  file: string;
  env: EnvRecord;
}

export interface SnapshotStore {
  snapshots: Snapshot[];
}

export function createSnapshot(
  file: string,
  env: EnvRecord,
  label?: string
): Snapshot {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    label,
    timestamp: new Date().toISOString(),
    file,
    env,
  };
}

export function saveSnapshot(snapshot: Snapshot, storePath: string): void {
  const store = loadSnapshotStore(storePath);
  store.snapshots.push(snapshot);
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
}

export function loadSnapshotStore(storePath: string): SnapshotStore {
  if (!fs.existsSync(storePath)) {
    return { snapshots: [] };
  }
  const raw = fs.readFileSync(storePath, 'utf8');
  return JSON.parse(raw) as SnapshotStore;
}

export function getSnapshot(storePath: string, id: string): Snapshot | undefined {
  const store = loadSnapshotStore(storePath);
  return store.snapshots.find((s) => s.id === id || s.label === id);
}

export function listSnapshots(storePath: string): Snapshot[] {
  return loadSnapshotStore(storePath).snapshots;
}

export function deleteSnapshot(storePath: string, id: string): boolean {
  const store = loadSnapshotStore(storePath);
  const before = store.snapshots.length;
  store.snapshots = store.snapshots.filter((s) => s.id !== id && s.label !== id);
  if (store.snapshots.length !== before) {
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
    return true;
  }
  return false;
}

export function formatSnapshotList(snapshots: Snapshot[], redact = false): string {
  if (snapshots.length === 0) return 'No snapshots found.';
  return snapshots
    .map((s) => {
      const label = s.label ? ` (${s.label})` : '';
      const keys = Object.keys(redact ? redactEnv(s.env) : s.env).length;
      return `[${s.id}]${label} — ${s.timestamp} — ${s.file} — ${keys} keys`;
    })
    .join('\n');
}
