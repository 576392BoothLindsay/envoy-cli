import type { Argv } from 'yargs';
import { watchEnvFile, formatWatchEvent } from '../../watch/envWatcher';

export function registerWatchCommand(yargs: Argv): Argv {
  return yargs.command(
    'watch <file>',
    'Watch a .env file for changes and display a diff on each update',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env file to watch',
          type: 'string',
          demandOption: true,
        })
        .option('debounce', {
          alias: 'd',
          type: 'number',
          default: 300,
          describe: 'Debounce delay in milliseconds',
        })
        .option('quiet', {
          alias: 'q',
          type: 'boolean',
          default: false,
          describe: 'Suppress output, only show diff lines',
        }),
    (argv) => {
      const file = argv.file as string;
      const debounceMs = argv.debounce as number;
      const quiet = argv.quiet as boolean;

      if (!quiet) {
        console.log(`Watching ${file} for changes... (Ctrl+C to stop)`);
      }

      watchEnvFile(file, {
        debounceMs,
        onChange: (event) => {
          const output = formatWatchEvent(event);
          console.log(output);
        },
      });

      // Keep process alive
      process.stdin.resume();
    }
  );
}
