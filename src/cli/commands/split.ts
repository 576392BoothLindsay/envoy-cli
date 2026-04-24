import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv } from '../../parser/envParser';
import { splitEnv, formatSplitResult } from '../../split/envSplitter';

export function registerSplitCommand(program: Command): void {
  program
    .command('split <file>')
    .description('Split a .env file into N-key chunks')
    .option('-s, --size <number>', 'Max keys per chunk', '10')
    .option('--summary', 'Print only the summary line', false)
    .action((file: string, options: { size: string; summary: boolean }) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const chunkSize = parseInt(options.size, 10);

      if (isNaN(chunkSize) || chunkSize < 1) {
        console.error('--size must be a positive integer');
        process.exit(1);
      }

      const result = splitEnv(env, chunkSize);
      const formatted = formatSplitResult(result);

      if (options.summary) {
        console.log(formatted.summary);
      } else {
        console.log(formatted.output);
        console.log(`\n# ${formatted.summary}`);
      }
    });
}
