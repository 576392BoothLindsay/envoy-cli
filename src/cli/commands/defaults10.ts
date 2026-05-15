import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import {
  applyDefaults10,
  formatDefaults10Result,
} from '../../defaults10/envDefaults10';

export function registerDefaults10Command(program: Command): void {
  program
    .command('defaults10 <envFile> <defaultsFile>')
    .description(
      'Apply default values from a defaults file to an env file (missing or empty keys only)'
    )
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option(
      '--overwrite-empty',
      'Also overwrite keys that exist but are empty',
      false
    )
    .option('--dry-run', 'Preview changes without writing', false)
    .action(
      (
        envFile: string,
        defaultsFile: string,
        opts: { output?: string; overwriteEmpty: boolean; dryRun: boolean }
      ) => {
        const envContent = readFileSync(envFile, 'utf-8');
        const defaultsContent = readFileSync(defaultsFile, 'utf-8');

        const env = parseEnv(envContent);
        const defaults = parseEnv(defaultsContent);

        const res = applyDefaults10(env, defaults, opts.overwriteEmpty);

        console.log(formatDefaults10Result(res));

        if (!opts.dryRun) {
          const serialized = serializeEnv(res.result);
          const target = opts.output ?? envFile;
          writeFileSync(target, serialized, 'utf-8');
          console.log(`Written to ${target}`);
        }
      }
    );
}
