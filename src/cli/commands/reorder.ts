import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { reorderKeys, reorderByPattern, formatReorderResult } from '../../reorder/envReorder';

export function registerReorderCommand(program: Command): void {
  program
    .command('reorder <file>')
    .description('Reorder keys in a .env file')
    .option('-o, --order <keys>', 'Comma-separated list of keys in desired order')
    .option('-p, --pattern <patterns>', 'Comma-separated regex patterns; matching keys moved to front')
    .option('--in-place', 'Write result back to the source file')
    .option('--dry-run', 'Preview changes without writing')
    .action((file: string, opts) => {
      const raw = readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const original = { ...env };

      let reordered = env;

      if (opts.order) {
        const order = opts.order.split(',').map((k: string) => k.trim());
        reordered = reorderKeys(env, order);
      } else if (opts.pattern) {
        const patterns = opts.pattern.split(',').map((p: string) => p.trim());
        reordered = reorderByPattern(env, patterns);
      } else {
        console.error('Provide --order or --pattern');
        process.exit(1);
      }

      const result = formatReorderResult({
        original,
        reordered,
        order: Object.keys(reordered),
      });

      console.log(result);

      if (!opts.dryRun) {
        const output = serializeEnv(reordered);
        if (opts.inPlace) {
          writeFileSync(file, output, 'utf-8');
        } else {
          console.log('\n' + output);
        }
      }
    });
}
