import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults, getMissingDefaults, formatDefaultsResult } from '../../defaults/envDefaults';

export function registerDefaultsCommand(program: Command): void {
  const cmd = program
    .command('defaults <envFile> <defaultsFile>')
    .description('Apply default values from a defaults file to an env file')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--overwrite', 'Overwrite existing keys with default values', false)
    .option('--missing-only', 'Only print keys that are missing (not applied)', false)
    .option('--format', 'Show formatted summary instead of env output', false);

  cmd.action((envFile: string, defaultsFile: string, options) => {
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

    if (options.missingOnly) {
      const missing = getMissingDefaults(env, defaults);
      const output = serializeEnv(missing);
      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
      } else {
        process.stdout.write(output);
      }
      return;
    }

    const result = applyDefaults(env, defaults, options.overwrite);

    if (options.format) {
      console.log(formatDefaultsResult(result));
      return;
    }

    const output = serializeEnv(result.result);
    if (options.output) {
      fs.writeFileSync(options.output, output, 'utf-8');
      console.log(formatDefaultsResult(result));
    } else {
      process.stdout.write(output);
    }
  });
}
