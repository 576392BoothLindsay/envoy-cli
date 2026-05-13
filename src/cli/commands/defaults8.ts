import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults8, formatDefaults8Result } from '../../defaults8/envDefaults8';

export function registerDefaults8Command(program: Command): void {
  program
    .command('defaults8 <envFile> <defaultsFile>')
    .description(
      'Apply defaults from a defaults file to an env file (missing or empty keys only)'
    )
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('-e, --overwrite-empty', 'Also replace empty values with defaults', false)
    .option('--no-summary', 'Suppress summary output')
    .action(
      (
        envFile: string,
        defaultsFile: string,
        opts: { output?: string; overwriteEmpty: boolean; summary: boolean }
      ) => {
        const env = parseEnv(readFileSync(envFile, 'utf-8'));
        const defaults = parseEnv(readFileSync(defaultsFile, 'utf-8'));

        const res = applyDefaults8(env, defaults, opts.overwriteEmpty);

        const serialized = serializeEnv(res.result);

        if (opts.output) {
          writeFileSync(opts.output, serialized, 'utf-8');
        } else {
          process.stdout.write(serialized + '\n');
        }

        if (opts.summary !== false) {
          process.stderr.write(formatDefaults8Result(res) + '\n');
        }
      }
    );
}
