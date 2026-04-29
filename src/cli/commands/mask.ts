import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv, formatMaskResult } from '../../mask/envMasker';

export function registerMaskCommand(program: Command): void {
  program
    .command('mask <file>')
    .description('Mask values in a .env file')
    .option('-k, --keys <keys>', 'Comma-separated list of keys to mask (default: all)')
    .option('-c, --char <char>', 'Masking character to use', '*')
    .option('-v, --visible <n>', 'Number of trailing characters to keep visible', '0')
    .option('-o, --output <file>', 'Write masked output to file instead of stdout')
    .action((file: string, options: Record<string, string>) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);

      const keys = options['keys']
        ? options['keys'].split(',').map((k: string) => k.trim())
        : undefined;

      const result = maskEnv(env, {
        char: options['char'] ?? '*',
        visibleChars: parseInt(options['visible'] ?? '0', 10),
        keys,
      });

      if (options['output']) {
        const serialized = serializeEnv(result.masked);
        fs.writeFileSync(options['output'], serialized, 'utf-8');
        console.log(`Masked env written to ${options['output']}`);
      } else {
        console.log(formatMaskResult(result));
      }
    });
}
