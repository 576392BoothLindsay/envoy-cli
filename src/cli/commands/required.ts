import { Command } from 'commander';
import { readFileSync } from 'fs';
import { parseEnv } from '../../parser/envParser';
import { checkRequired, formatRequiredResult } from '../../required/envRequired';

export function registerRequiredCommand(program: Command): void {
  program
    .command('required <envFile>')
    .description('Check that all required keys are present in an env file')
    .requiredOption('-k, --keys <keys>', 'Comma-separated list of required keys')
    .option('--json', 'Output result as JSON')
    .action((envFile: string, options: { keys: string; json?: boolean }) => {
      let content: string;
      try {
        content = readFileSync(envFile, 'utf-8');
      } catch {
        console.error(`Error: Could not read file "${envFile}"`);
        process.exit(1);
      }

      const env = parseEnv(content);
      const requiredKeys = options.keys.split(',').map((k) => k.trim()).filter(Boolean);
      const result = checkRequired(env, requiredKeys);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatRequiredResult(result));
      }

      if (!result.valid) {
        process.exit(1);
      }
    });
}
