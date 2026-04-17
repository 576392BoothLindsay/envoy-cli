import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

const tmpFile = join(os.tmpdir(), 'envoy-replace-test.env');

function writeTempEnv(content: string) {
  writeFileSync(tmpFile, content);
}

function cleanup() {
  try { unlinkSync(tmpFile); } catch {}
}

function runCli(args: string): string {
  return execSync(`ts-node src/cli/bin.ts ${args}`, { encoding: 'utf-8' });
}

afterEach(cleanup);

describe('replace command', () => {
  it('replaces values and prints result', () => {
    writeTempEnv('API_URL=http://localhost:3000\nDB_URL=http://localhost:5432\n');
    const out = runCli(`replace ${tmpFile} localhost remotehost`);
    expect(out).toContain('remotehost');
  });

  it('writes back to file with --write', () => {
    writeTempEnv('API_URL=http://localhost:3000\n');
    runCli(`replace ${tmpFile} localhost 127.0.0.1 --write --quiet`);
    const content = readFileSync(tmpFile, 'utf-8');
    expect(content).toContain('127.0.0.1');
    expect(content).not.toContain('localhost');
  });

  it('limits replacement to specified keys', () => {
    writeTempEnv('API_URL=http://localhost:3000\nDB_URL=http://localhost:5432\n');
    const out = runCli(`replace ${tmpFile} localhost remotehost --keys API_URL`);
    expect(out).toContain('API_URL=http://remotehost:3000');
    expect(out).toContain('DB_URL=http://localhost:5432');
  });
});
