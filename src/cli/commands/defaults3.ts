import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyDefaults3, formatDefaults3Result } from '../../defaults3/envDefaults3';

export function registerDefaults3Command(program: Command): void {
  program
    .command('defaults3 <envFile>')
    .description('Apply defaults to a .env file, filling missing or empty values')
    .requiredOption('-d, --defaults <file>', 'Path to defaults .env file')
    .option('--no-overwrite-empty', 'Skip keys that exist but are empty')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--summary', 'Print a summary instead of the resulting env')
    .action((envFile: string, options) => {
      if (!fs.existsSync(envFile)) {
        console.error(`Error: env file not found: ${envFile}`);
        process.exit(1);
      }

      if (!fs.existsSync(options.defaults)) {
        console.error(`Error: defaults file not found: ${options.defaults}`);
        process.exit(1);
      }

      const env = parseEnv(fs.readFileSync(envFile, 'utf-8'));
      const defaults = parseEnv(fs.readFileSync(options.defaults, 'utf-8'));
      const overwriteEmpty = options.overwriteEmpty !== false;

      const result = applyDefaults3(env, defaults, overwriteEmpty);

      if (options.summary) {
        console.log(formatDefaults3Result(result));
        return;
      }

      const serialized = serializeEnv(result.final);

      if (options.output) {
        fs.writeFileSync(options.output, serialized, 'utf-8');
        console.log(`Written to ${options.output}`);
      } else {
        process.stdout.write(serialized);
      }
    });
}
