import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const tmpDir = os.tmpdir();

function writeTempEnv(filename: string, content: string): string {
  const filepath = path.join(tmpDir, filename);
  fs.writeFileSync(filepath, content, 'utf-8');
  return filepath;
}

function cleanup(...files: string[]): void {
  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}

function runCli(args: string): string {
  return execSync(`npx ts-node src/cli/index.ts ${args}`, {
    encoding: 'utf-8',
    cwd: process.cwd(),
  });
}

describe('duplicate command', () => {
  let envFile: string;

  beforeEach(() => {
    envFile = writeTempEnv('test-duplicate.env', [
      'API_KEY=secret123',
      'DB_PASSWORD=secret123',
      'APP_NAME=myapp',
      'SERVICE_NAME=myapp',
      'PORT=3000',
    ].join('\n'));
  });

  afterEach(() => {
    cleanup(envFile);
  });

  it('should detect duplicate values', () => {
    const output = runCli(`duplicate ${envFile}`);
    expect(output).toContain('secret123');
    expect(output).toContain('API_KEY');
    expect(output).toContain('DB_PASSWORD');
  });

  it('should detect all duplicate value groups', () => {
    const output = runCli(`duplicate ${envFile}`);
    expect(output).toContain('myapp');
    expect(output).toContain('APP_NAME');
    expect(output).toContain('SERVICE_NAME');
  });

  it('should report no duplicates when all values are unique', () => {
    const uniqueFile = writeTempEnv('test-unique.env', [
      'A=1',
      'B=2',
      'C=3',
    ].join('\n'));
    try {
      const output = runCli(`duplicate ${uniqueFile}`);
      expect(output).toContain('No duplicate');
    } finally {
      cleanup(uniqueFile);
    }
  });
});
