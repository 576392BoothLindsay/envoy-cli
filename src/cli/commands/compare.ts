import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv } from '../../parser/envParser';
import { compareEnvs, formatCompareResult } from '../../compare/envCompare';
import { redactEnv } from '../../redact/secretRedactor';

export function registerCompareCommand(program: Command): void {
  program
    .command('compare <source> <target>')
    .description('Compare two .env files and report differences')
    .option('--redact', 'Redact secret values in conflict output', false)
    .option('--json', 'Output result as JSON', false)
    .option(
      '--fail-on-conflict',
      'Exit with non-zero code if conflicts are found',
      false
    )
    .action(
      (
        sourcePath: string,
        targetPath: string,
        options: { redact: boolean; json: boolean; failOnConflict: boolean }
      ) => {
        if (!fs.existsSync(sourcePath)) {
          console.error(`Source file not found: ${sourcePath}`);
          process.exit(1);
        }
        if (!fs.existsSync(targetPath)) {
          console.error(`Target file not found: ${targetPath}`);
          process.exit(1);
        }

        let source = parseEnv(fs.readFileSync(sourcePath, 'utf-8'));
        let target = parseEnv(fs.readFileSync(targetPath, 'utf-8'));

        if (options.redact) {
          source = redactEnv(source);
          target = redactEnv(target);
        }

        const result = compareEnvs(source, target);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(formatCompareResult(result));
        }

        if (options.failOnConflict && result.summary.conflicts > 0) {
          process.exit(1);
        }
      }
    );
}
