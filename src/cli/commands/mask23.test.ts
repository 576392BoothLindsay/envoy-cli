import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function writeTempEnv(content: string): string {
  const file = join(tmpdir(), `mask23-test-${Date.now()}.env`);
  writeFileSync(file, content);
  return file;
}

function cleanup(...files: string[]): void {
  for (const f of files) {
    try { unlinkSync(f); } catch {}
  }
}

describe('registerMask23Command (integration)', () => {
  it('masks specified keys and prints result', async () => {
    const file = writeTempEnv('API_KEY=supersecret\nPORT=3000\n');
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      const { registerMask23Command } = await import('./mask23');
      const yargs = require('yargs/yargs')(['mask23', file, '--keys', 'API_KEY']);
      registerMask23Command(yargs).parse();
      await new Promise((r) => setTimeout(r, 50));
      expect(logs.some((l) => l.includes('Masked'))).toBe(true);
    } finally {
      console.log = origLog;
      cleanup(file);
    }
  });

  it('handles missing keys gracefully', async () => {
    const file = writeTempEnv('PORT=3000\n');
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      const { registerMask23Command } = await import('./mask23');
      const yargs = require('yargs/yargs')(['mask23', file, '--keys', 'MISSING']);
      registerMask23Command(yargs).parse();
      await new Promise((r) => setTimeout(r, 50));
      expect(logs.some((l) => l.includes('No keys masked'))).toBe(true);
    } finally {
      console.log = origLog;
      cleanup(file);
    }
  });
});
