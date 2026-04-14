import { Argv } from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../../parser/envParser';
import { lintEnv, formatLintResult, getAvailableRules } from '../../lint/envLinter';

export function registerLintCommand(yargs: Argv): Argv {
  return yargs.command(
    'lint <file>',
    'Lint a .env file for common issues',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env file to lint',
          type: 'string',
          demandOption: true,
        })
        .option('strict', {
          alias: 's',
          type: 'boolean',
          default: false,
          describe: 'Treat warnings as errors',
        })
        .option('rules', {
          alias: 'r',
          type: 'boolean',
          default: false,
          describe: 'List all available lint rules',
        }),
    (argv) => {
      if (argv.rules) {
        const rules = getAvailableRules();
        console.log('Available lint rules:');
        for (const rule of rules) {
          console.log(`  [${rule.severity.toUpperCase()}] ${rule.id}: ${rule.description}`);
        }
        return;
      }

      const filePath = path.resolve(argv.file as string);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const env = parseEnv(raw);
      const result = lintEnv(env);

      console.log(formatLintResult(result));

      const failed = !result.passed || (argv.strict && result.warningCount > 0);
      if (failed) {
        process.exit(1);
      }
    }
  );
}
