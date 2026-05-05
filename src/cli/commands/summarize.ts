import { Command } from 'commander';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { summarizeEnv, formatSummaryResult } from '../../summarize/envSummarizer';

export function registerSummarizeCommand(program: Command): void {
  program
    .command('summarize <file>')
    .description('Display a statistical summary of a .env file')
    .option('--json', 'Output result as JSON')
    .action((file: string, options: { json?: boolean }) => {
      let raw: string;
      try {
        raw = readFileSync(file, 'utf-8');
      } catch {
        console.error(`Error: Could not read file "${file}"`);
        process.exit(1);
      }

      const env = parseEnv(raw);
      const result = summarizeEnv(env);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatSummaryResult(result));
      }
    });
}
