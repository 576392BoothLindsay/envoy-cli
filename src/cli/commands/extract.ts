import type { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { extractKeys, extractByPattern, formatExtractResult } from '../../extract/envExtractor';

export function registerExtractCommand(yargs: Argv): Argv {
  return yargs.command(
    'extract <file>',
    'Extract specific keys from an .env file',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: 'Source .env file' })
        .option('keys', { type: 'string', describe: 'Comma-separated keys to extract' })
        .option('pattern', { type: 'string', describe: 'Regex pattern to match keys' })
        .option('out', { type: 'string', describe: 'Output file for extracted keys' })
        .option('rest', { type: 'string', describe: 'Output file for remaining keys' }),
    (argv) => {
      const raw = fs.readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);

      let result;
      if (argv.pattern) {
        result = extractByPattern(env, argv.pattern as string);
      } else if (argv.keys) {
        const keys = (argv.keys as string).split(',').map((k) => k.trim());
        result = extractKeys(env, keys);
      } else {
        console.error('Provide --keys or --pattern');
        process.exit(1);
      }

      if (argv.out) {
        fs.writeFileSync(argv.out as string, serializeEnv(result.extracted));
      }
      if (argv.rest) {
        fs.writeFileSync(argv.rest as string, serializeEnv(result.remaining));
      }

      console.log(formatExtractResult(result));
    }
  );
}
