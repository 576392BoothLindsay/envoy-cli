import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import {
  applyDefaults12,
  formatDefaults12Result,
} from '../../defaults12/envDefaults12';

export function registerDefaults12Command(program: Command): void {
  program
    .command('defaults12 <envFile> <defaultsFile>')
    .description('Apply default values from a defaults file to an env file')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--overwrite', 'Overwrite existing keys with default values', false)
    .option('--summary', 'Print a summary of applied/skipped keys', false)
    .action(
      (
        envFile: string,
        defaultsFile: string,
        options: { output?: string; overwrite: boolean; summary: boolean }
      ) => {
        const envContent = readFileSync(envFile, 'utf-8');
        const defaultsContent = readFileSync(defaultsFile, 'utf-8');

        const env = parseEnv(envContent);
        const defaults = parseEnv(defaultsContent);

        const result = applyDefaults12(env, defaults, options.overwrite);

        if (options.summary) {
          console.log(formatDefaults12Result(result));
          return;
        }

        const serialized = serializeEnv(result.env);

        if (options.output) {
          writeFileSync(options.output, serialized, 'utf-8');
          console.log(`Wrote merged env to ${options.output}`);
        } else {
          process.stdout.write(serialized);
        }
      }
    );
}
