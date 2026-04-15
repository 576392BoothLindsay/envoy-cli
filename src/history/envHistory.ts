import * as fs from 'fs';
import * as path from 'path';
import { EnvRecord } from '../parser/envParser';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  label?: string;
  env: EnvRecord;
  filePath: string;
}

export interface HistoryStore {
  entries: HistoryEntry[];
}

const DEFAULT_HISTORY_PATH = '.envoy-history.json';

export function generateHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadHistoryStore(storePath: string = DEFAULT_HISTORY_PATH): HistoryStore {
  if (!fs.existsSync(storePath)) {
    return { entries: [] };
  }
  try {
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw) as HistoryStore;
  } catch {
    return { entries: [] };
  }
}

export function saveHistoryStore(store: HistoryStore, storePath: string = DEFAULT_HISTORY_PATH): void {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function recordHistory(
  env: EnvRecord,
  filePath: string,
  label?: string,
  storePath: string = DEFAULT_HISTORY_PATH
): HistoryEntry {
  const store = loadHistoryStore(storePath);
  const entry: HistoryEntry = {
    id: generateHistoryId(),
    timestamp: new Date().toISOString(),
    label,
    env,
    filePath,
  };
  store.entries.push(entry);
  saveHistoryStore(store, storePath);
  return entry;
}

export function getHistoryEntry(id: string, storePath: string = DEFAULT_HISTORY_PATH): HistoryEntry | undefined {
  const store = loadHistoryStore(storePath);
  return store.entries.find((e) => e.id === id);
}

export function listHistory(
  filePath?: string,
  storePath: string = DEFAULT_HISTORY_PATH
): HistoryEntry[] {
  const store = loadHistoryStore(storePath);
  if (filePath) {
    return store.entries.filter((e) => e.filePath === filePath);
  }
  return store.entries;
}

export function clearHistory(storePath: string = DEFAULT_HISTORY_PATH): void {
  saveHistoryStore({ entries: [] }, storePath);
}

export function formatHistoryList(entries: HistoryEntry[]): string {
  if (entries.length === 0) return 'No history entries found.';
  return entries
    .map((e) => {
      const label = e.label ? ` (${e.label})` : '';
      const keyCount = Object.keys(e.env).length;
      return `[${e.id}] ${e.timestamp}${label} — ${e.filePath} (${keyCount} keys)`;
    })
    .join('\n');
}
