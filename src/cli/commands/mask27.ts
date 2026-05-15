import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv27, formatMask27Result } from '../../mask27/envMask27';

export function registerMask27Command(program: Command): void {
  program
    .command('mask27 <file>')
    .description('Mask specific env keys with configurable visibility')
    .requiredOption('-k, --keys <keys>', 'Comma-separated list of keys to mask')
    .option('-c, --char <char>', 'Mask character to use', '*')
    .option('--visible-start <n>', 'Number of visible characters at start', '2')
    .option('--visible-end <n>', 'Number of visible characters at end', '2')
    .option('--min-length <n>', 'Minimum length before masking applies', '4')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .action((file, opts) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const keys = opts.keys.split(',').map((k: string) => k.trim());

      const result = maskEnv27(env, keys, {
        char: opts.char,
        visibleStart: parseInt(opts.visibleStart, 10),
        visibleEnd: parseInt(opts.visibleEnd, 10),
        minLength: parseInt(opts.minLength, 10),
      });

      if (opts.output) {
        fs.writeFileSync(opts.output, serializeEnv(result.masked));
        console.log(formatMask27Result(result));
      } else {
        console.log(formatMask27Result(result));
        console.log();
        console.log(serializeEnv(result.masked));
      }
    });
}
