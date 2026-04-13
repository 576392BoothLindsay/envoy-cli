import type { Argv } from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { redactEnv, getRedactedKeys } from '../../redact/secretRedactor';

/**
 * Registers the `redact` command with the CLI.
 *
 * Usage:
 *   envoy redact <file> [options]
 *
 * Examples:
 *   envoy redact .env
 *   envoy redact .env --output .env.redacted
 *   envoy redact .env --show-keys
 *   envoy redact .env --placeholder "[HIDDEN]"
 */
export function registerRedactCommand(cli: Argv): Argv {
  return cli.command(
    'redact <file>',
    'Redact secret values from an .env file',
    (yargs) =>
      yargs
        .positional('file', {
          describe: 'Path to the .env file to redact',
          type: 'string',
          demandOption: true,
        })
        .option('output', {
          alias: 'o',
          type: 'string',
          describe: 'Write redacted output to a file instead of stdout',
        })
        .option('show-keys', {
          alias: 'k',
          type: 'boolean',
          default: false,
          describe: 'Print the list of keys that were redacted',
        })
        .option('placeholder', {
          alias: 'p',
          type: 'string',
          default: '***REDACTED***',
          describe: 'Placeholder value to use for redacted secrets',
        }),
    (argv) => {
      const filePath = argv.file as string;

      let raw: string;
      try {
        raw = readFileSync(filePath, 'utf-8');
      } catch (err) {
        console.error(`Error: could not read file "${filePath}"`);
        process.exit(1);
      }

      const parsed = parseEnv(raw);
      const redacted = redactEnv(parsed, argv.placeholder as string);

      if (argv['show-keys']) {
        const keys = getRedactedKeys(parsed);
        if (keys.length === 0) {
          console.log('No secrets detected.');
        } else {
          console.log('Redacted keys:');
          keys.forEach((key) => console.log(`  - ${key}`));
        }
      }

      const serialized = serializeEnv(redacted);

      if (argv.output) {
        try {
          writeFileSync(argv.output as string, serialized, 'utf-8');
          console.log(`Redacted env written to "${argv.output}"`);
        } catch (err) {
          console.error(`Error: could not write to "${argv.output}"`);
          process.exit(1);
        }
      } else {
        process.stdout.write(serialized);
      }
    }
  );
}
