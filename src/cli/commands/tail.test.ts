import { Command } from 'commander';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { registerTailCommand } from './tail';

const tmpFile = join(__dirname, '__test_tail__.env');

function writeTempEnv(content: string): void {
  writeFileSync(tmpFile, content, 'utf-8');
}

function cleanup(): void {
  try { unlinkSync(tmpFile); } catch {}
}

function runCli(args: string[]): string {
  const logs: string[] = [];
  const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
  const program = new Command();
  program.exitOverride();
  registerTailCommand(program);
  try {
    program.parse(['node', 'envoy', ...args]);
  } catch {}
  spy.mockRestore();
  return logs.join('\n');
}

afterEach(cleanup);

describe('tail command', () => {
  it('shows last N entries', () => {
    writeTempEnv('A=1\nB=2\nC=3\nD=4\nE=5\n');
    const out = runCli(['tail', tmpFile, '-n', '3']);
    expect(out).toContain('C');
    expect(out).toContain('D');
    expect(out).toContain('E');
    expect(out).not.toContain('A=');
  });

  it('filters by prefix before tailing', () => {
    writeTempEnv('DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=test\nDB_USER=admin\n');
    const out = runCli(['tail', tmpFile, '--prefix', 'DB_', '-n', '2']);
    expect(out).toContain('DB_PORT');
    expect(out).toContain('DB_USER');
    expect(out).not.toContain('APP_NAME');
  });

  it('outputs JSON when --json flag is set', () => {
    writeTempEnv('X=1\nY=2\n');
    const out = runCli(['tail', tmpFile, '--json']);
    const parsed = JSON.parse(out);
    expect(parsed).toBeDefined();
  });
});
