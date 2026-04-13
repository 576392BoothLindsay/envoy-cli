import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../../parser/envParser';
import { auditEnv, formatAuditResult } from '../../audit/envAudit';

export function registerAuditCommand(program: Command): void {
  program
    .command('audit <file>')
    .description('Audit a .env file for common issues: empty values, exposed secrets, invalid key names, and duplicate keys')
    .option('--json', 'Output results as JSON')
    .option('--strict', 'Exit with non-zero code if any warnings are found')
    .action((file: string, options: { json?: boolean; strict?: boolean }) => {
      const filePath = path.resolve(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const rawLines = raw.split('\n');
      const env = parseEnv(raw);
      const result = auditEnv(env, rawLines);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatAuditResult(result));
      }

      if (result.hasErrors) {
        process.exit(1);
      }

      if (options.strict && result.hasWarnings) {
        process.exit(1);
      }
    });
}
