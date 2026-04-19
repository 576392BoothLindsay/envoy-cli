import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { unmaskEnv, formatUnmaskResult } from '../../unmask/envUnmasker';

export function registerUnmaskCommand(program: Command): void {
  program
    .command('unmask <masked> <reference>')
    .description('Restore masked values in an env file using a reference env file')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .option('--mask-char <char>', 'Character used for masking', '*')
    .option('--summary', 'Print a summary of restored keys')
    .action((maskedFile: string, referenceFile: string, opts) => {
      if (!fs.existsSync(maskedFile)) {
        console.error(`Error: masked file not found: ${maskedFile}`);
        process.exit(1);
      }
      if (!fs.existsSync(referenceFile)) {
        console.error(`Error: reference file not found: ${referenceFile}`);
        process.exit(1);
      }

      const maskedEnv = parseEnv(fs.readFileSync(maskedFile, 'utf-8'));
      const referenceEnv = parseEnv(fs.readFileSync(referenceFile, 'utf-8'));

      const result = unmaskEnv(maskedEnv, referenceEnv, opts.maskChar);
      const serialized = serializeEnv(result.unmasked);

      if (opts.output) {
        fs.writeFileSync(opts.output, serialized, 'utf-8');
        console.log(`Unmasked env written to ${opts.output}`);
      } else {
        console.log(serialized);
      }

      if (opts.summary) {
        console.log(formatUnmaskResult(result));
      }
    });
}
