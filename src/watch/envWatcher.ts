import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../parser/envParser';
import { diffEnv, formatDiff } from '../diff/envDiff';

export interface WatchEvent {
  filePath: string;
  timestamp: Date;
  previous: Record<string, string>;
  current: Record<string, string>;
  diff: ReturnType<typeof diffEnv>;
}

export type WatchCallback = (event: WatchEvent) => void;

export interface WatchOptions {
  debounceMs?: number;
  onChange?: WatchCallback;
}

export function watchEnvFile(
  filePath: string,
  options: WatchOptions = {}
): fs.FSWatcher {
  const { debounceMs = 300, onChange } = options;
  const resolved = path.resolve(filePath);

  let previous: Record<string, string> = {};
  try {
    const content = fs.readFileSync(resolved, 'utf-8');
    previous = parseEnv(content);
  } catch {
    // file may not exist yet
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const watcher = fs.watch(resolved, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        const content = fs.readFileSync(resolved, 'utf-8');
        const current = parseEnv(content);
        const diff = diffEnv(previous, current);
        if (onChange) {
          onChange({ filePath: resolved, timestamp: new Date(), previous, current, diff });
        }
        previous = current;
      } catch {
        // ignore read errors during watch
      }
    }, debounceMs);
  });

  return watcher;
}

export function formatWatchEvent(event: WatchEvent): string {
  const lines: string[] = [
    `[${event.timestamp.toISOString()}] ${event.filePath} changed`,
  ];
  const diffOutput = formatDiff(event.diff);
  if (diffOutput.trim()) {
    lines.push(diffOutput);
  } else {
    lines.push('  (no variable changes detected)');
  }
  return lines.join('\n');
}
