import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { applyUppercase, formatUppercaseResult } from '../../uppercase/envUppercase';

export function registerUppercaseCommand(program: Command): void {
  program
    .command('uppercase <file>')
    .description('Uppercase keys, values, or both in a .env file')
    .option('--target <target>', 'What to uppercase: keys, values, or both', 'keys')
    .option('--write', 'Write changes back to the file')
    .option('--json', 'Output result as JSON')
    .action((file: string, options: { target: string; write: boolean; json: boolean }) => {
      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const target = options.target as 'keys' | 'values' | 'both';
      if (!['keys', 'values', 'both'].includes(target)) {
        console.error(`Invalid target: ${target}. Must be keys, values, or both.`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const res = applyUppercase(env, target);

      if (options.json) {
        console.log(JSON.stringify(res.result, null, 2));
        return;
      }

      console.log(formatUppercaseResult(res));

      if (options.write) {
        fs.writeFileSync(file, serializeEnv(res.result), 'utf-8');
        console.log(`Written to ${file}`);
      } else {
        console.log('\nPreview:');
        console.log(serializeEnv(res.result));
      }
    });
}
