import { describe, it, expect, afterAll } from 'vitest';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { createCli } from '../index';

const tmpA = join('/tmp', 'test-dup-a.env');
const tmpB = join('/tmp', 'test-dup-b.env');
const tmpOut = join('/tmp', 'test-dup-out.env');

function writeTempEnv(path: string, content: string) {
  writeFileSync(path, content, 'utf-8');
}

function cleanup() {
  [tmpA, tmpB, tmpOut].forEach((f) => {
    if (existsSync(f)) unlinkSync(f);
  });
}

afterAll(cleanup);

describe('duplicate command', () => {
  it('detects and reports duplicate keys', async () => {
    writeTempEnv(tmpA, 'FOO=bar\nBAZ=qux\n');
    writeTempEnv(tmpB, 'FOO=override\nNEW=value\n');

    const logs: string[] = [];
    const cli = createCli();
    jest?.spyOn?.(console, 'log');
    const origLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    await cli.parseAsync(['node', 'envoy', 'duplicate', '--dry-run', tmpA, tmpB]);
    console.log = origLog;

    const output = logs.join('\n');
    expect(output).toContain('FOO');
  });

  it('writes cleaned output to file', async () => {
    writeTempEnv(tmpA, 'A=1\nB=2\n');
    writeTempEnv(tmpB, 'A=99\nC=3\n');

    const cli = createCli();
    await cli.parseAsync(['node', 'envoy', 'duplicate', '-o', tmpOut, tmpA, tmpB]);

    expect(existsSync(tmpOut)).toBe(true);
    const content = require('fs').readFileSync(tmpOut, 'utf-8');
    expect(content).toContain('A=1');
    expect(content).not.toContain('A=99');
  });
});
