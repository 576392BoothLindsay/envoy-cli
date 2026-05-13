import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults7, formatDefaults7Result } from '../../defaults7/envDefaults7';

export function registerDefaults7Command(program: Command): void {
  program
    .command('defaults7 <envFile> <defaultsFile>')
    .description('Apply defaults from a defaults file to an env file (v7)')
    .option('-o, --output <file>', 'Write merged result to file instead of stdout')
    .option('--override', 'Override existing keys with default values', false)
    .option('--summary', 'Print a summary instead of the merged env', false)
    .action((envFile: string, defaultsFile: string, opts: {
      output?: string;
      override: boolean;
      summary: boolean;
    }) => {
      if (!fs.existsSync(envFile)) {
        console.error(`Error: env file not found: ${envFile}`);
        process.exit(1);
      }
      if (!fs.existsSync(defaultsFile)) {
        console.error(`Error: defaults file not found: ${defaultsFile}`);
        process.exit(1);
      }

      const env = parseEnv(fs.readFileSync(envFile, 'utf8'));
      const defaults = parseEnv(fs.readFileSync(defaultsFile, 'utf8'));
      const result = applyDefaults7(env, defaults, opts.override);

      if (opts.summary) {
        console.log(formatDefaults7Result(result));
        return;
      }

      const serialized = serializeEnv(result.merged);

      if (opts.output) {
        fs.writeFileSync(opts.output, serialized, 'utf8');
        console.log(formatDefaults7Result(result));
      } else {
        console.log(serialized);
      }
    });
}
