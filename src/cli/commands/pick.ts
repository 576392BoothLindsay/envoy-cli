import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { pickKeys, pickByPattern, formatPickResult } from '../../pick/envPick';

export function registerPickCommand(program: Command): void {
  program
    .command('pick <file> <keys...>')
    .description('Pick specific keys from an env file')
    .option('-o, --output <file>', 'Write result to file')
    .option('-p, --pattern <regex>', 'Pick keys matching a regex pattern')
    .option('--json', 'Output as JSON')
    .action((file: string, keys: string[], options) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);

      const result = options.pattern
        ? pickByPattern(env, new RegExp(options.pattern))
        : pickKeys(env, keys);

      if (options.json) {
        const out = JSON.stringify(result.picked, null, 2);
        if (options.output) {
          writeFileSync(options.output, out);
          console.log(`Wrote ${result.count} key(s) to ${options.output}`);
        } else {
          console.log(out);
        }
        return;
      }

      if (options.output) {
        writeFileSync(options.output, serializeEnv(result.picked));
        console.log(`Wrote ${result.count} key(s) to ${options.output}`);
      } else {
        console.log(formatPickResult(result));
      }

      if (result.missing.length > 0) {
        process.exitCode = 1;
      }
    });
}
