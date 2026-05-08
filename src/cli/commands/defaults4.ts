import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults4, formatDefaults4Result } from '../../defaults4/envDefaults4';

export function registerDefaults4Command(program: Command): void {
  program
    .command('defaults4 <envFile> <defaultsFile>')
    .description('Apply default values from a defaults file to an env file')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--override', 'Override existing values with defaults', false)
    .option('--keys <keys>', 'Comma-separated list of keys to apply defaults for')
    .option('--missing', 'Show missing keys only, do not apply')
    .action((envFile: string, defaultsFile: string, opts) => {
      const envContent = readFileSync(envFile, 'utf-8');
      const defaultsContent = readFileSync(defaultsFile, 'utf-8');
      const env = parseEnv(envContent);
      const defaults = parseEnv(defaultsContent);

      const keys = opts.keys
        ? opts.keys.split(',').map((k: string) => k.trim())
        : undefined;

      if (opts.missing) {
        const { getMissingDefaults4 } = require('../../defaults4/envDefaults4');
        const missing = getMissingDefaults4(env, defaults);
        if (missing.length === 0) {
          console.log('All defaults are already set.');
        } else {
          console.log('Missing or blank keys:');
          missing.forEach((k: string) => console.log(`  ${k}`));
        }
        return;
      }

      const result = applyDefaults4(env, defaults, {
        override: opts.override,
        keys,
      });

      const output = serializeEnv(result.result);

      if (opts.output) {
        writeFileSync(opts.output, output);
        console.log(formatDefaults4Result(result));
      } else {
        console.log(output);
        console.error(formatDefaults4Result(result));
      }
    });
}
