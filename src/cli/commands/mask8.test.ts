import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createCli } from '../index';

const tmpDir = os.tmpdir();

function writeTempEnv(content: string): string {
  const filePath = path.join(tmpDir, `mask8-test-${Date.now()}.env`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function cleanup(...files: string[]): void {
  for (const f of files) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}

describe('mask8 command', () => {
  it('prints masked result to stdout', async () => {
    const file = writeTempEnv('API_KEY=topsecret\nNAME=alice\n');
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    try {
      const cli = createCli();
      await cli.parseAsync(['mask8', file, '--keys', 'API_KEY']);
      expect(logs.join('\n')).toContain('API_KEY');
    } finally {
      spy.mockRestore();
      cleanup(file);
    }
  });

  it('writes masked output to file', async () => {
    const file = writeTempEnv('SECRET=abcdefgh\nPUBLIC=hello\n');
    const outFile = path.join(tmpDir, `mask8-out-${Date.now()}.env`);

    try {
      const cli = createCli();
      await cli.parseAsync(['mask8', file, '--keys', 'SECRET', '--output', outFile]);
      const content = fs.readFileSync(outFile, 'utf-8');
      expect(content).toContain('SECRET');
      expect(content).not.toContain('abcdefgh');
    } finally {
      cleanup(file, outFile);
    }
  });

  it('respects custom mask char', async () => {
    const file = writeTempEnv('TOKEN=mysecrettoken\n');
    const logs: string[] = [];
    const spy = jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));

    try {
      const cli = createCli();
      await cli.parseAsync(['mask8', file, '--keys', 'TOKEN', '--char', '#']);
      expect(logs.join('\n')).toContain('#');
    } finally {
      spy.mockRestore();
      cleanup(file);
    }
  });
});
