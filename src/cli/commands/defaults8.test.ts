import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { registerDefaults8Command } from './defaults8';

const tmpEnv = join(__dirname, '__defaults8_env_tmp__.env');
const tmpDefaults = join(__dirname, '__defaults8_defaults_tmp__.env');
const tmpOut = join(__dirname, '__defaults8_out_tmp__.env');

function writeTempEnv(path: string, content: string) {
  writeFileSync(path, content, 'utf-8');
}

function cleanup() {
  [tmpEnv, tmpDefaults, tmpOut].forEach((f) => {
    try { unlinkSync(f); } catch { /* ignore */ }
  });
}

describe('registerDefaults8Command', () => {
  afterEach(cleanup);

  it('registers the defaults8 command', () => {
    const program = new Command();
    registerDefaults8Command(program);
    const cmd = program.commands.find((c) => c.name() === 'defaults8');
    expect(cmd).toBeDefined();
  });

  it('applies missing defaults and writes output file', () => {
    writeTempEnv(tmpEnv, 'A=existing\n');
    writeTempEnv(tmpDefaults, 'A=default_a\nB=default_b\n');

    const program = new Command();
    registerDefaults8Command(program);
    program.parse([
      'node', 'envoy',
      'defaults8', tmpEnv, tmpDefaults,
      '--output', tmpOut,
      '--no-summary',
    ]);

    const { readFileSync } = require('fs');
    const out = readFileSync(tmpOut, 'utf-8');
    expect(out).toContain('A=existing');
    expect(out).toContain('B=default_b');
  });

  it('overwrites empty values with --overwrite-empty flag', () => {
    writeTempEnv(tmpEnv, 'A=\n');
    writeTempEnv(tmpDefaults, 'A=filled\n');

    const program = new Command();
    registerDefaults8Command(program);
    program.parse([
      'node', 'envoy',
      'defaults8', tmpEnv, tmpDefaults,
      '--output', tmpOut,
      '--overwrite-empty',
      '--no-summary',
    ]);

    const { readFileSync } = require('fs');
    const out = readFileSync(tmpOut, 'utf-8');
    expect(out).toContain('A=filled');
  });
});
