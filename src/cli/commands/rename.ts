import type { Argv } from 'yargs';
import fs from 'fs';
import path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { renameKeys, formatRenameResult } from '../../rename/envRename';

export function registerRenameCommand(yargs: Argv): Argv {
  return yargs.command(
    'rename <file> <renames..>',
    'Rename one or more keys in an .env file',
    (y) =>
      y
        .positional('file', {
          describe: 'Path to the .env file',
          type: 'string',
          demandOption: true,
        })
        .positional('renames', {
          describe: 'Key rename pairs in OLD_KEY=NEW_KEY format',
          type: 'string',
          array: true,
          demandOption: true,
        })
        .option('overwrite', {
          alias: 'o',
          type: 'boolean',
          default: false,
          describe: 'Overwrite existing key if newKey already exists',
        })
        .option('dry-run', {
          alias: 'd',
          type: 'boolean',
          default: false,
          describe: 'Preview changes without writing to disk',
        }),
    (argv) => {
      const filePath = path.resolve(argv.file as string);
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const env = parseEnv(raw);

      const operations = (argv.renames as string[]).map((pair) => {
        const [oldKey, newKey] = pair.split('=');
        if (!oldKey || !newKey) {
          console.error(`Invalid rename pair: "${pair}". Expected OLD_KEY=NEW_KEY format.`);
          process.exit(1);
        }
        return { oldKey, newKey };
      });

      const { env: updated, result } = renameKeys(env, operations, argv.overwrite as boolean);

      const summary = formatRenameResult(result);
      if (summary) console.log(summary);

      if (argv['dry-run']) {
        console.log('\n[Dry run] No changes written.');
        return;
      }

      fs.writeFileSync(filePath, serializeEnv(updated), 'utf-8');
      console.log(`\nUpdated ${filePath}`);
    }
  );
}
