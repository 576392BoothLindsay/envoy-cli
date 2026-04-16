import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function writeTempEnv(content: string): string {
  const p = join(tmpdir(), `omit-test-${Date.now()}.env`);
  writeFileSync(p, content);
  return p;
}

function cleanup(...files: string[]) {
  for (const f of files) {
    try { unlinkSync(f); } catch {}
  }
}

describe('omit CLI command', () => {
  it('omits specified keys and prints result', () => {
    const file = writeTempEnv('APP_NAME=myapp\nAPP_SECRET=secret\nDB_HOST=localhost\n');
    try {
      const out = execSync(
        `npx ts-node -e "require('./src/cli/index').run()" -- omit ${file} --keys APP_SECRET --quiet`,
        { encoding: 'utf-8' }
      );
      expect(out).toContain('APP_NAME=myapp');
      expect(out).not.toContain('APP_SECRET');
    } finally {
      cleanup(file);
    }
  });

  it('omits keys by pattern', () => {
    const file = writeTempEnv('DB_HOST=localhost\nDB_PASS=pass\nAPP_NAME=myapp\n');
    try {
      const out = execSync(
        `npx ts-node -e "require('./src/cli/index').run()" -- omit ${file} --pattern "^DB_" --quiet`,
        { encoding: 'utf-8' }
      );
      expect(out).toContain('APP_NAME=myapp');
      expect(out).not.toContain('DB_HOST');
      expect(out).not.toContain('DB_PASS');
    } finally {
      cleanup(file);
    }
  });
});
