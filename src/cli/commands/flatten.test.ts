import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const tmp = (name: string) => join(tmpdir(), name);

function writeTempEnv(name: string, content: string): string {
  const p = tmp(name);
  writeFileSync(p, content, 'utf-8');
  return p;
}

function cleanup(...paths: string[]) {
  for (const p of paths) if (existsSync(p)) unlinkSync(p);
}

import { flattenEnv } from '../../flatten/envFlattener';
import { parseEnv } from '../../parser/envParser';

describe('flatten command integration', () => {
  it('flattens a JSON env value', () => {
    const env = { DB: JSON.stringify({ host: 'localhost', port: '5432' }) };
    const result = flattenEnv(env, { separator: '__' });
    expect(result.flattened['DB__HOST']).toBe('localhost');
    expect(result.flattened['DB__PORT']).toBe('5432');
  });

  it('round-trips through parseEnv', () => {
    const filePath = writeTempEnv('flatten-test.env', 'DB={"host":"localhost"}\nFOO=bar\n');
    const raw = require('fs').readFileSync(filePath, 'utf-8');
    const env = parseEnv(raw);
    const result = flattenEnv(env, { separator: '_' });
    expect(result.flattened['FOO']).toBe('bar');
    cleanup(filePath);
  });

  it('handles empty env gracefully', () => {
    const result = flattenEnv({});
    expect(result.count).toBe(0);
    expect(result.flattened).toEqual({});
  });
});
