import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv10, formatMask10Result } from '../../mask10/envMask10';

export function registerMask10Command(program: Command): void {
  program
    .command('mask10 <file>')
    .description('Mask specific keys in a .env file with configurable visibility')
    .requiredOption('-k, --keys <keys>', 'Comma-separated list of keys to mask')
    .option('-c, --char <char>', 'Mask character to use', '*')
    .option('--visible-start <n>', 'Number of visible characters at start', '2')
    .option('--visible-end <n>', 'Number of visible characters at end', '2')
    .option('--min-length <n>', 'Minimum length to apply partial masking', '4')
    .option('-o, --output <file>', 'Output file (defaults to stdout)')
    .action((file, options) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const keys = options.keys.split(',').map((k: string) => k.trim());

      const maskOptions = {
        char: options.char,
        visibleStart: parseInt(options.visibleStart, 10),
        visibleEnd: parseInt(options.visibleEnd, 10),
        minLength: parseInt(options.minLength, 10),
      };

      const result = maskEnv10(env, keys, maskOptions);

      if (options.output) {
        const serialized = serializeEnv(result.masked);
        fs.writeFileSync(options.output, serialized, 'utf-8');
        console.log(formatMask10Result(result));
      } else {
        console.log(formatMask10Result(result));
        console.log();
        console.log(serializeEnv(result.masked));
      }
    });
}
