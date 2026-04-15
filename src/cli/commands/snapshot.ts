import { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv } from '../../parser/envParser';
import {
  createSnapshot,
  saveSnapshot,
  getSnapshot,
  listSnapshots,
  deleteSnapshot,
  formatSnapshotList,
} from '../../snapshot/envSnapshot';
import { diffEnv, formatDiff } from '../../diff/envDiff';

const DEFAULT_STORE = '.envoy-snapshots.json';

export function registerSnapshotCommand(yargs: Argv): Argv {
  return yargs.command(
    'snapshot <action>',
    'Manage .env file snapshots',
    (y) =>
      y
        .positional('action', {
          describe: 'Action: save | list | diff | delete',
          type: 'string',
          choices: ['save', 'list', 'diff', 'delete'],
        })
        .option('file', { alias: 'f', type: 'string', default: '.env', describe: 'Env file to snapshot' })
        .option('label', { alias: 'l', type: 'string', describe: 'Label for the snapshot' })
        .option('id', { type: 'string', describe: 'Snapshot id or label for diff/delete' })
        .option('store', { type: 'string', default: DEFAULT_STORE, describe: 'Path to snapshot store' }),
    (argv) => {
      const { action, file, label, id, store } = argv as any;

      if (action === 'save') {
        if (!fs.existsSync(file)) {
          console.error(`File not found: ${file}`);
          process.exit(1);
        }
        const raw = fs.readFileSync(file, 'utf8');
        const env = parseEnv(raw);
        const snap = createSnapshot(file, env, label);
        saveSnapshot(snap, store);
        console.log(`Snapshot saved: [${snap.id}]${label ? ` (${label})` : ''}`);
        return;
      }

      if (action === 'list') {
        const snaps = listSnapshots(store);
        console.log(formatSnapshotList(snaps));
        return;
      }

      if (action === 'diff') {
        if (!id) { console.error('--id is required for diff'); process.exit(1); }
        if (!fs.existsSync(file)) { console.error(`File not found: ${file}`); process.exit(1); }
        const snap = getSnapshot(store, id);
        if (!snap) { console.error(`Snapshot not found: ${id}`); process.exit(1); }
        const current = parseEnv(fs.readFileSync(file, 'utf8'));
        const result = diffEnv(snap.env, current);
        console.log(formatDiff(result));
        return;
      }

      if (action === 'delete') {
        if (!id) { console.error('--id is required for delete'); process.exit(1); }
        const removed = deleteSnapshot(store, id);
        if (removed) {
          console.log(`Snapshot deleted: ${id}`);
        } else {
          console.error(`Snapshot not found: ${id}`);
          process.exit(1);
        }
      }
    }
  );
}
