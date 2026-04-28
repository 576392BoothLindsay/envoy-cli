import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv, formatMaskResult, MaskOptions } from '../../mask/envMasker';

export function registerMaskCommand(program: Command): void {
  program
    .command('mask <file>')
    .description('Mask the values of specified keys in an env file')
    .requiredOption('-k, --keys <keys>', 'Comma-separated list of keys to mask')
    .option('-c, --char <char>', 'Mask character to use', '*')
    .option('-v, --visible <n>', 'Number of trailing characters to keep visible', '0')
    .option('-o, --output <file>', 'Output file (defaults to stdout)')
    .option('--in-place', 'Overwrite the input file')
    .action((file: string, opts) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const keys = opts.keys.split(',').map((k: string) => k.trim());

      const maskOptions: MaskOptions = {
        char: opts.char,
        visibleChars: parseInt(opts.visible, 10),
      };

      const result = maskEnv(env, keys, maskOptions);

      if (opts.inPlace) {
        writeFileSync(file, serializeEnv(result.masked));
        console.log(formatMaskResult(result));
      } else if (opts.output) {
        writeFileSync(opts.output, serializeEnv(result.masked));
        console.log(formatMaskResult(result));
      } else {
        console.log(serializeEnv(result.masked));
        console.error(formatMaskResult(result));
      }
    });
}
