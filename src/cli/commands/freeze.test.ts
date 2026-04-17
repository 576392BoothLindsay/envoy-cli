import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function writeTempEnv(content: string): string {
  const path = join(tmpdir(), `freeze-test-${Date.now()}-${Math.random()}.env`);
  writeFileSync(path, content);
  return path;
}

const files: string[] = [];
function cleanup() {
  files.forEach(f => { try { unlinkSync(f); } catch {} });
}

afterAll(cleanup);

describe('freeze command', () => {
  it('prints frozen key summary', () => {
    const f = writeTempEnv('API_KEY=secret\nDEBUG=true\n');
    files.push(f);
    const out = execSync(`npx ts-node src/cli/index.ts freeze ${f} --keys API_KEY`).toString();
    expect(out).toContain('API_KEY');
  });

  it('applies freeze against target file', () => {
    const base = writeTempEnv('API_KEY=original\nDEBUG=true\n');
    const target = writeTempEnv('API_KEY=changed\nDEBUG=false\n');
    files.push(base, target);
    const out = execSync(
      `npx ts-node src/cli/index.ts freeze ${base} --keys API_KEY --target ${target}`
    ).toString();
    expect(out).toContain('API_KEY=original');
    expect(out).toContain('DEBUG=false');
  });

  it('reports skipped keys not in base', () => {
    const f = writeTempEnv('A=1\n');
    files.push(f);
    const out = execSync(`npx ts-node src/cli/index.ts freeze ${f} --keys MISSING`).toString();
    expect(out).toContain('Skipped');
  });
});
