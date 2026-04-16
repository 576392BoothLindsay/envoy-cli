import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { inheritEnv, formatInheritResult } from '../../inherit/envInherit';

export function registerInheritCommand(program: Command): void {
  program
    .command('inherit <base> <override>')
    .description('Inherit env values from a base file, overriding with another file')
    .option('-o, --output <file>', 'Write merged result to file')
    .option('--json', 'Output merged env as JSON')
    .option('--summary', 'Show inheritance summary')
    .action((baseFile: string, overrideFile: string, options) => {
      if (!fs.existsSync(baseFile)) {
        console.error(`Base file not found: ${baseFile}`);
        process.exit(1);
      }
      if (!fs.existsSync(overrideFile)) {
        console.error(`Override file not found: ${overrideFile}`);
        process.exit(1);
      }

      const base = parseEnv(fs.readFileSync(baseFile, 'utf-8'));
      const override = parseEnv(fs.readFileSync(overrideFile, 'utf-8'));
      const result = inheritEnv(base, override);

      if (options.summary) {
        console.log(formatInheritResult(result));
        return;
      }

      const output = options.json
        ? JSON.stringify(result.merged, null, 2)
        : serializeEnv(result.merged);

      if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        console.log(`Merged env written to ${options.output}`);
      } else {
        console.log(output);
      }
    });
}
