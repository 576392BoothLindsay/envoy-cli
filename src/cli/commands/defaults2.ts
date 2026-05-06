import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults2, formatDefaults2Result } from '../../defaults2/envDefaults2';

export function registerDefaults2Command(program: Command): void {
  program
    .command('defaults2 <envFile> <defaultsFile>')
    .description('Apply a defaults file to an env file, filling in missing or empty keys')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--overwrite', 'Overwrite existing keys with defaults', false)
    .option('--prefix <prefix>', 'Prefix to apply to default keys when inserting')
    .option('--summary', 'Print a summary of applied/skipped keys', false)
    .action((envFile: string, defaultsFile: string, options) => {
      if (!fs.existsSync(envFile)) {
        console.error(`Error: env file not found: ${envFile}`);
        process.exit(1);
      }
      if (!fs.existsSync(defaultsFile)) {
        console.error(`Error: defaults file not found: ${defaultsFile}`);
        process.exit(1);
      }

      const env = parseEnv(fs.readFileSync(envFile, 'utf-8'));
      const defaults = parseEnv(fs.readFileSync(defaultsFile, 'utf-8'));

      const result = applyDefaults2(env, defaults, {
        overwrite: options.overwrite,
        prefix: options.prefix,
      });

      const serialized = serializeEnv(result.result);

      if (options.output) {
        fs.writeFileSync(options.output, serialized, 'utf-8');
        if (options.summary) {
          console.log(formatDefaults2Result(result));
        }
      } else {
        console.log(serialized);
        if (options.summary) {
          console.error(formatDefaults2Result(result));
        }
      }
    });
}
