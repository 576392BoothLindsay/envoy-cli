import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { padEnv, formatPadResult, PadDirection } from '../../pad/envPadder';

export function registerPadCommand(program: Command): void {
  program
    .command('pad <file>')
    .description('Pad env values to a minimum length')
    .requiredOption('-l, --length <number>', 'Target pad length')
    .option('-c, --char <char>', 'Padding character', ' ')
    .option(
      '-d, --direction <direction>',
      'Pad direction: start | end | both',
      'end'
    )
    .option('-k, --keys <keys>', 'Comma-separated list of keys to pad')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--in-place', 'Overwrite the input file')
    .action((file, opts) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);

      const length = parseInt(opts.length, 10);
      if (isNaN(length) || length <= 0) {
        console.error('Error: --length must be a positive integer');
        process.exit(1);
      }

      const validDirections: PadDirection[] = ['start', 'end', 'both'];
      if (!validDirections.includes(opts.direction as PadDirection)) {
        console.error('Error: --direction must be one of: start, end, both');
        process.exit(1);
      }

      const keys = opts.keys
        ? opts.keys.split(',').map((k: string) => k.trim())
        : undefined;

      const result = padEnv(env, {
        length,
        char: opts.char,
        direction: opts.direction as PadDirection,
        keys,
      });

      const serialized = serializeEnv(result.padded);

      if (opts.inPlace) {
        writeFileSync(file, serialized, 'utf-8');
        console.log(formatPadResult(result));
      } else if (opts.output) {
        writeFileSync(opts.output, serialized, 'utf-8');
        console.log(formatPadResult(result));
      } else {
        console.log(serialized);
      }
    });
}
