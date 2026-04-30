import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv3, formatMask3Result, Mask3Strategy } from '../../mask3/envMask3';

export function registerMask3Command(program: Command): void {
  program
    .command('mask3 <file>')
    .description('Mask env values using a configurable strategy')
    .requiredOption('-k, --keys <keys>', 'Comma-separated list of keys to mask')
    .option(
      '-s, --strategy <strategy>',
      'Masking strategy: full, partial, length (default: full)',
      'full'
    )
    .option('-c, --char <char>', 'Mask character to use', '*')
    .option('-v, --visible <n>', 'Number of visible chars for partial strategy', '2')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .option('--in-place', 'Overwrite the input file')
    .action((file, opts) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const keys = opts.keys.split(',').map((k: string) => k.trim());

      const result = maskEnv3(env, keys, {
        strategy: opts.strategy as Mask3Strategy,
        char: opts.char,
        visibleChars: parseInt(opts.visible, 10),
      });

      const serialized = serializeEnv(result.masked);

      if (opts.inPlace) {
        fs.writeFileSync(file, serialized, 'utf-8');
        console.log(formatMask3Result(result));
      } else if (opts.output) {
        fs.writeFileSync(opts.output, serialized, 'utf-8');
        console.log(formatMask3Result(result));
      } else {
        console.log(serialized);
      }
    });
}
