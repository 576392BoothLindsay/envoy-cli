import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { maskEnv, formatMaskResult, MaskStrategy } from '../../mask/envMasker';

export function registerMaskCommand(program: Command): void {
  program
    .command('mask <file>')
    .description('Mask secret values in a .env file')
    .option('-s, --strategy <strategy>', 'Mask strategy: full, partial, length', 'full')
    .option('-c, --char <char>', 'Character to use for masking', '*')
    .option('-v, --visible <n>', 'Number of visible characters (partial strategy)', '4')
    .option('-k, --keys <keys>', 'Comma-separated list of additional keys to mask')
    .option('-o, --output <file>', 'Write masked output to file instead of stdout')
    .option('--summary', 'Show a summary of masked keys')
    .action((file: string, options) => {
      const filePath = path.resolve(file);

      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const env = parseEnv(raw);

      const customKeys = options.keys
        ? options.keys.split(',').map((k: string) => k.trim())
        : undefined;

      const strategy = options.strategy as MaskStrategy;
      const validStrategies: MaskStrategy[] = ['full', 'partial', 'length'];
      if (!validStrategies.includes(strategy)) {
        console.error(`Invalid strategy: ${strategy}. Use full, partial, or length.`);
        process.exit(1);
      }

      const result = maskEnv(
        env,
        {
          strategy,
          char: options.char,
          visibleChars: parseInt(options.visible, 10),
        },
        customKeys
      );

      if (options.summary) {
        console.log(formatMaskResult(result));
        return;
      }

      const serialized = serializeEnv(result.masked);

      if (options.output) {
        const outPath = path.resolve(options.output);
        fs.writeFileSync(outPath, serialized, 'utf-8');
        console.log(`Masked env written to ${outPath}`);
      } else {
        process.stdout.write(serialized);
      }
    });
}
