import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { replaceInEnv, formatReplaceResult } from '../../replace/envReplace';

export function registerReplaceCommand(cli: Argv): void {
  cli.command(
    'replace <file> <search> <replacement>',
    'Replace a string in env values',
    (yargs) =>
      yargs
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .positional('search', { type: 'string', demandOption: true, describe: 'String to search for' })
        .positional('replacement', { type: 'string', demandOption: true, describe: 'Replacement string' })
        .option('keys', { type: 'array', string: true, describe: 'Limit to specific keys' })
        .option('pattern', { type: 'string', describe: 'Regex pattern to match key names' })
        .option('flags', { type: 'string', default: 'g', describe: 'Regex flags' })
        .option('write', { type: 'boolean', default: false, describe: 'Write result back to file' })
        .option('quiet', { type: 'boolean', default: false, describe: 'Suppress output' }),
    (argv) => {
      const content = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(content);
      const result = replaceInEnv(env, argv.search as string, argv.replacement as string, {
        keys: argv.keys as string[] | undefined,
        pattern: argv.pattern as string | undefined,
        flags: argv.flags as string,
      });

      if (!argv.quiet) {
        console.log(formatReplaceResult(result));
      }

      if (argv.write) {
        writeFileSync(argv.file as string, serializeEnv(result.replaced));
      } else {
        process.stdout.write(serializeEnv(result.replaced));
      }
    }
  );
}
