import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../../parser/envParser';
import { diffEnv, formatDiff } from '../../diff/envDiff';
import { redactEnv } from '../../redact/secretRedactor';

export function registerDiffCommand(program: Command): void {
  program
    .command('diff <base> <target>')
    .description('Show differences between two .env files')
    .option('--no-redact', 'Disable secret redaction in output')
    .option('--format <format>', 'Output format: text | json', 'text')
    .action((base: string, target: string, options: { redact: boolean; format: string }) => {
      const basePath = path.resolve(process.cwd(), base);
      const targetPath = path.resolve(process.cwd(), target);

      if (!fs.existsSync(basePath)) {
        console.error(`Error: Base file not found: ${basePath}`);
        process.exit(1);
      }
      if (!fs.existsSync(targetPath)) {
        console.error(`Error: Target file not found: ${targetPath}`);
        process.exit(1);
      }

      const baseEnv = parseEnv(fs.readFileSync(basePath, 'utf-8'));
      const targetEnv = parseEnv(fs.readFileSync(targetPath, 'utf-8'));

      const baseDisplay = options.redact ? redactEnv(baseEnv) : baseEnv;
      const targetDisplay = options.redact ? redactEnv(targetEnv) : targetEnv;

      const diffs = diffEnv(baseDisplay, targetDisplay);

      if (options.format === 'json') {
        console.log(JSON.stringify(diffs, null, 2));
      } else {
        console.log(formatDiff(diffs));
      }
    });
}
