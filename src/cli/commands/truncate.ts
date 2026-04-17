import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { truncateEnv, formatTruncateResult } from '../../truncate/envTruncator';

export function registerTruncateCommand(program: Command): void {
  program
    .command('truncate <file>')
    .description('Truncate long values in an .env file')
    .requiredOption('-m, --max-length <number>', 'Maximum value length')
    .option('-s, --suffix <string>', 'Suffix to append to truncated values', '...')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to truncate')
    .option('-o, --output <file>', 'Output file (defaults to stdout)')
    .option('--in-place', 'Overwrite the input file')
    .action((file, opts) => {
      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const maxLength = parseInt(opts.maxLength, 10);
      if (isNaN(maxLength) || maxLength <= 0) {
        console.error('Error: --max-length must be a positive integer');
        process.exit(1);
      }
      const keys = opts.keys ? opts.keys.split(',').map((k: string) => k.trim()) : undefined;
      const result = truncateEnv(env, { maxLength, suffix: opts.suffix, keys });
      const serialized = serializeEnv(result.truncated);

      if (opts.inPlace) {
        fs.writeFileSync(file, serialized);
      } else if (opts.output) {
        fs.writeFileSync(opts.output, serialized);
      } else {
        console.log(serialized);
      }
      console.error(formatTruncateResult(result));
    });
}
