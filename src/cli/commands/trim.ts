import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { trimEnv, formatTrimResult, TrimTarget } from '../../trim/envTrimmer';

export function registerTrimCommand(program: Command): void {
  program
    .command('trim <file>')
    .description('Trim whitespace from keys and/or values in a .env file')
    .option(
      '-t, --target <target>',
      'What to trim: keys, values, or both (default: both)',
      'both'
    )
    .option(
      '--remove-empty',
      'Remove entries with empty values after trimming',
      false
    )
    .option('-o, --output <file>', 'Write trimmed output to a file instead of stdout')
    .option('--in-place', 'Overwrite the input file with trimmed output', false)
    .option('--dry-run', 'Preview changes without writing to disk', false)
    .action(
      (
        file: string,
        opts: {
          target: TrimTarget;
          removeEmpty: boolean;
          output?: string;
          inPlace: boolean;
          dryRun: boolean;
        }
      ) => {
        if (!fs.existsSync(file)) {
          console.error(`File not found: ${file}`);
          process.exit(1);
        }

        const raw = fs.readFileSync(file, 'utf-8');
        const env = parseEnv(raw);

        const result = trimEnv(env, {
          target: opts.target,
          removeEmptyLines: opts.removeEmpty,
        });

        console.log(formatTrimResult(result));

        if (opts.dryRun) {
          console.log('\nDry run — no files written.');
          return;
        }

        const serialized = serializeEnv(result.trimmed);
        const destination = opts.inPlace ? file : opts.output;

        if (destination) {
          fs.writeFileSync(destination, serialized, 'utf-8');
          console.log(`\nWrote trimmed env to: ${destination}`);
        } else {
          console.log('\n' + serialized);
        }
      }
    );
}
