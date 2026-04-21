import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { expandEnv, formatExpandResult } from '../../expand/envExpander';

export function registerExpandCommand(program: Command): void {
  program
    .command('expand <file>')
    .description('Expand variable references (${VAR} / $VAR) within a .env file')
    .option('-o, --output <file>', 'Write expanded output to a file instead of stdout')
    .option('--in-place', 'Overwrite the source file with expanded values')
    .option('--summary', 'Print expansion summary to stderr')
    .action((file: string, options: { output?: string; inPlace?: boolean; summary?: boolean }) => {
      if (!fs.existsSync(file)) {
        console.error(`Error: file not found: ${file}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(file, 'utf-8');
      const env = parseEnv(raw);
      const result = expandEnv(env);
      const serialized = serializeEnv(result.expanded);

      if (options.summary) {
        process.stderr.write(formatExpandResult(result) + '\n');
      }

      const dest = options.inPlace ? file : options.output;
      if (dest) {
        fs.writeFileSync(dest, serialized, 'utf-8');
        if (!options.summary) {
          console.log(`Expanded env written to ${dest}`);
        }
      } else {
        process.stdout.write(serialized);
      }
    });
}
