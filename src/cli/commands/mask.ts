import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv, formatMaskResult } from '../../mask/envMasker';

export function registerMaskCommand(program: Command): void {
  program
    .command('mask <file>')
    .description('Mask values in a .env file')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to mask (default: all)')
    .option('-c, --char <char>', 'Mask character to use', '*')
    .option('-v, --visible <n>', 'Number of trailing characters to leave visible', '0')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .option('--summary', 'Print summary instead of masked file')
    .action((file, opts) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const content = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(content);

      const keys = opts.keys
        ? opts.keys.split(',').map((k: string) => k.trim())
        : undefined;

      const result = maskEnv(env, {
        char: opts.char,
        visibleChars: parseInt(opts.visible, 10),
        keys,
      });

      if (opts.summary) {
        console.log(formatMaskResult(result));
        return;
      }

      const output = serializeEnv(result.masked);

      if (opts.output) {
        fs.writeFileSync(opts.output, output, 'utf-8');
        console.log(`Masked env written to ${opts.output}`);
      } else {
        console.log(output);
      }
    });
}
