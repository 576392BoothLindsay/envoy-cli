import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults6, formatDefaults6Result } from '../../defaults6/envDefaults6';

export function registerDefaults6Command(program: Command): void {
  program
    .command('defaults6 <envFile>')
    .description('Apply default values to missing (or empty) keys in an env file')
    .option('-d, --defaults <pairs...>', 'KEY=VALUE pairs to use as defaults')
    .option('-e, --overwrite-empty', 'Also overwrite keys with empty string values', false)
    .option('-o, --output <file>', 'Write result to a file instead of stdout')
    .action((envFile: string, opts: { defaults?: string[]; overwriteEmpty: boolean; output?: string }) => {
      let env: Record<string, string> = {};
      try {
        const raw = readFileSync(envFile, 'utf-8');
        env = parseEnv(raw);
      } catch {
        console.error(`Error: could not read file "${envFile}"`);
        process.exit(1);
      }

      const defaults: Record<string, string> = {};
      for (const pair of opts.defaults ?? []) {
        const idx = pair.indexOf('=');
        if (idx === -1) {
          console.error(`Error: invalid default pair "${pair}" (expected KEY=VALUE)`);
          process.exit(1);
        }
        defaults[pair.slice(0, idx)] = pair.slice(idx + 1);
      }

      const result = applyDefaults6(env, defaults, opts.overwriteEmpty);
      console.error(formatDefaults6Result(result));

      const serialized = serializeEnv(result.env);
      if (opts.output) {
        writeFileSync(opts.output, serialized, 'utf-8');
        console.error(`Written to ${opts.output}`);
      } else {
        process.stdout.write(serialized);
      }
    });
}
