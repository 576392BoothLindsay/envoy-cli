import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function writeTempEnv(content: string): string {
  const p = join(tmpdir(), `encode-test-${Date.now()}.env`);
  writeFileSync(p, content);
  return p;
}

function cleanup(...paths: string[]) {
  paths.forEach((p) => { if (existsSync(p)) unlinkSync(p); });
}

function runCli(args: string): string {
  return execSync(`npx ts-node -e "require('./src/cli/index').run()" -- ${args}`, {
    encoding: 'utf-8',
    cwd: process.cwd(),
  });
}

describe('encode command', () => {
  it('encodes values as base64 by default', () => {
    const file = writeTempEnv('KEY=hello\nSECRET=world\n');
    try {
      const out = execSync(
        `npx ts-node src/cli/index.ts encode ${file}`,
        { encoding: 'utf-8' }
      );
      expect(out).toContain('aGVsbG8=');
      expect(out).toContain('d29ybGQ=');
    } finally {
      cleanup(file);
    }
  });

  it('encodes values as hex', () => {
    const file = writeTempEnv('KEY=hi\n');
    try {
      const out = execSync(
        `npx ts-node src/cli/index.ts encode ${file} --format hex`,
        { encoding: 'utf-8' }
      );
      expect(out).toContain('6869');
    } finally {
      cleanup(file);
    }
  });

  it('decodes base64 values', () => {
    const file = writeTempEnv('KEY=aGVsbG8=\n');
    try {
      const out = execSync(
        `npx ts-node src/cli/index.ts encode ${file} --decode`,
        { encoding: 'utf-8' }
      );
      expect(out).toContain('hello');
    } finally {
      cleanup(file);
    }
  });

  it('encodes only specified keys', () => {
    const file = writeTempEnv('KEY=hello\nOTHER=plain\n');
    try {
      const out = execSync(
        `npx ts-node src/cli/index.ts encode ${file} --keys KEY`,
        { encoding: 'utf-8' }
      );
      expect(out).toContain('aGVsbG8=');
      expect(out).toContain('plain');
    } finally {
      cleanup(file);
    }
  });
});
