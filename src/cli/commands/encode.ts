import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { encodeEnv, decodeEnv, formatEncodeResult } from '../../encode/envEncoder';

export function registerEncodeCommand(yargs: Argv): Argv {
  return yargs.command(
    'encode <file>',
    'Encode or decode values in a .env file',
    (y) =>
      y
        .positional('file', { type: 'string', demandOption: true, describe: 'Path to .env file' })
        .option('format', {
          alias: 'f',
          type: 'string',
          choices: ['base64', 'hex', 'uri'] as const,
          default: 'base64',
          describe: 'Encoding format',
        })
        .option('decode', {
          alias: 'd',
          type: 'boolean',
          default: false,
          describe: 'Decode instead of encode',
        })
        .option('keys', {
          alias: 'k',
          type: 'array',
          string: true,
          describe: 'Specific keys to encode/decode (default: all)',
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          describe: 'Write result to file instead of stdout',
        }),
    (argv) => {
      const raw = readFileSync(argv.file as string, 'utf-8');
      const env = parseEnv(raw);
      const format = argv.format as 'base64' | 'hex' | 'uri';
      const keys = argv.keys as string[] | undefined;

      const result = argv.decode
        ? decodeEnv(env, format, keys)
        : encodeEnv(env, format, keys);

      if (argv.output) {
        writeFileSync(argv.output as string, serializeEnv(result.env));
        console.log(formatEncodeResult(result));
      } else {
        console.log(serializeEnv(result.env));
      }
    }
  );
}
