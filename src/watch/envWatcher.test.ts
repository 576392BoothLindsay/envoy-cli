import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFile, formatWatchEvent, WatchEvent } from './envWatcher';

function writeTempEnv(dir: string, name: string, content: string): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

describe('watchEnvFile', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envoy-watch-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should call onChange when file is modified', (done) => {
    const filePath = writeTempEnv(tmpDir, '.env', 'FOO=bar\n');
    const events: WatchEvent[] = [];

    const watcher = watchEnvFile(filePath, {
      debounceMs: 50,
      onChange: (event) => {
        events.push(event);
        watcher.close();
        expect(event.current['FOO']).toBe('baz');
        expect(event.previous['FOO']).toBe('bar');
        expect(event.diff.modified).toContain('FOO');
        done();
      },
    });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'FOO=baz\n', 'utf-8');
    }, 80);
  }, 3000);

  it('should detect added keys', (done) => {
    const filePath = writeTempEnv(tmpDir, '.env2', 'A=1\n');

    const watcher = watchEnvFile(filePath, {
      debounceMs: 50,
      onChange: (event) => {
        watcher.close();
        expect(event.diff.added).toContain('B');
        done();
      },
    });

    setTimeout(() => {
      fs.writeFileSync(filePath, 'A=1\nB=2\n', 'utf-8');
    }, 80);
  }, 3000);
});

describe('formatWatchEvent', () => {
  it('should include timestamp and file path', () => {
    const event: WatchEvent = {
      filePath: '/tmp/.env',
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      previous: { A: '1' },
      current: { A: '2' },
      diff: { added: [], removed: [], modified: ['A'], unchanged: [] },
    };
    const output = formatWatchEvent(event);
    expect(output).toContain('2024-01-01T00:00:00.000Z');
    expect(output).toContain('/tmp/.env');
  });

  it('should show no changes message when diff is empty', () => {
    const event: WatchEvent = {
      filePath: '/tmp/.env',
      timestamp: new Date(),
      previous: { A: '1' },
      current: { A: '1' },
      diff: { added: [], removed: [], modified: [], unchanged: ['A'] },
    };
    const output = formatWatchEvent(event);
    expect(output).toContain('no variable changes detected');
  });
});
