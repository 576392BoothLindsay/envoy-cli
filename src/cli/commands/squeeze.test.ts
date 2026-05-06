import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createCli } from '../index';

const tmpFile = join('/tmp', 'squeeze-test.env');
const outFile = join('/tmp', 'squeeze-out.env');

function writeTempEnv(content: string): void {
  writeFileSync(tmpFile, content, 'utf-8');
}

function cleanup(): void {
  if (existsSync(tmpFile)) unlinkSync(tmpFile);
  if (existsSync(outFile)) unlinkSync(outFile);
}

afterEach(cleanup);

describe('squeeze command', () => {
  it('removes blank values and writes to stdout', async () => {
    writeTempEnv('FOO=bar\nBAR=\nBAZ=hello\nEMPTY=\n');
    const logs: string[] = [];
    const origWrite = process.stdout.write.bind(process.stdout);
    let captured = '';
    process.stdout.write = (chunk: any) => { captured += chunk; return true; };

    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'squeeze', tmpFile]);

    process.stdout.write = origWrite;
    expect(captured).toContain('FOO=bar');
    expect(captured).toContain('BAZ=hello');
    expect(captured).not.toContain('BAR=');
    expect(captured).not.toContain('EMPTY=');
  });

  it('writes squeezed output to --output file', async () => {
    writeTempEnv('A=1\nB=\nC=3\n');
    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'squeeze', tmpFile, '--output', outFile]);

    const content = readFileSync(outFile, 'utf-8');
    expect(content).toContain('A=1');
    expect(content).toContain('C=3');
    expect(content).not.toContain('B=');
  });

  it('overwrites input file with --in-place', async () => {
    writeTempEnv('X=foo\nY=\nZ=baz\n');
    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'squeeze', tmpFile, '--in-place']);

    const content = readFileSync(tmpFile, 'utf-8');
    expect(content).toContain('X=foo');
    expect(content).toContain('Z=baz');
    expect(content).not.toContain('Y=');
  });

  it('shows removed keys with --show-removed', async () => {
    writeTempEnv('KEEP=yes\nDROP=\n');
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (...args: any[]) => logs.push(args.join(' '));

    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'squeeze', tmpFile, '--show-removed', '--output', outFile]);

    console.log = origLog;
    const combined = logs.join('\n');
    expect(combined).toMatch(/DROP/);
  });
});
