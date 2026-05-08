import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults5, formatDefaults5Result } from '../../defaults5/envDefaults5';

export function registerDefaults5Command(program: Command): void {
  program
    .command('defaults5 <envFile> <defaultsFile>')
    .description('Apply defaults from a defaults file to an env file (missing or empty keys only)')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('-e, --override-empty', 'Also override keys that exist but are empty', false)
    .option('--format', 'Print a human-readable summary instead of serialized env')
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
      const result = applyDefaults5(env, defaults, options.overrideEmpty);

      if (options.format) {
        console.log(formatDefaults5Result(result));
        return;
      }

      const serialized = serializeEnv(result.env);

      if (options.output) {
        fs.writeFileSync(options.output, serialized, 'utf-8');
        console.log(`Written to ${options.output}`);
        console.log(formatDefaults5Result(result));
      } else {
        console.log(serialized);
      }
    });
}
