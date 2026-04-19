import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createCli } from '../index';

function writeTempEnv(content: string): string {
  const file = join(tmpdir(), `wrap-test-${Date.now()}.env`);
  writeFileSync(file, content);
  return file;
}

function cleanup(...files: string[]) {
  for (const f of files) {
    try { unlinkSync(f); } catch {}
  }
}

describe('wrap command', () => {
  it('wraps values with prefix and suffix', async () => {
    const file = writeTempEnv('FOO=bar\nBAZ=qux\n');
    const output = join(tmpdir(), `wrap-out-${Date.now()}.env`);
    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'wrap', file, '-k', 'FOO', '--prefix', '[', '--suffix', ']', '-o', output]);
    const result = readFileSync(output, 'utf-8');
    expect(result).toContain('FOO=[bar]');
    expect(result).toContain('BAZ=qux');
    cleanup(file, output);
  });

  it('wraps values with double quotes', async () => {
    const file = writeTempEnv('KEY=value\n');
    const output = join(tmpdir(), `wrap-out-${Date.now()}.env`);
    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'wrap', file, '-k', 'KEY', '--quote', 'double', '-o', output]);
    const result = readFileSync(output, 'utf-8');
    expect(result).toContain('KEY="value"');
    cleanup(file, output);
  });

  it('writes back to file with --write', async () => {
    const file = writeTempEnv('A=1\nB=2\n');
    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'wrap', file, '-k', 'A', '--prefix', 'v', '--write']);
    const result = readFileSync(file, 'utf-8');
    expect(result).toContain('A=v1');
    cleanup(file);
  });
});
