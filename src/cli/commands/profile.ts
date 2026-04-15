import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import {
  createProfile,
  addProfile,
  removeProfile,
  getProfile,
  listProfiles,
  applyProfile,
  formatProfileResult,
  ProfileStore,
} from '../../profile/envProfile';

const DEFAULT_STORE = '.envoy-profiles.json';

function loadStore(storePath: string): ProfileStore {
  if (!fs.existsSync(storePath)) return { profiles: {} };
  return JSON.parse(fs.readFileSync(storePath, 'utf-8'));
}

function saveStore(storePath: string, store: ProfileStore): void {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

export function registerProfileCommand(program: Command): void {
  const cmd = program.command('profile').description('Manage named env profiles');

  cmd
    .command('save <name> <envFile>')
    .description('Save an env file as a named profile')
    .option('--desc <description>', 'Profile description')
    .option('--store <path>', 'Profile store path', DEFAULT_STORE)
    .action((name: string, envFile: string, opts) => {
      const raw = fs.readFileSync(envFile, 'utf-8');
      const env = parseEnv(raw);
      const store = loadStore(opts.store);
      const profile = createProfile(name, env, opts.desc);
      saveStore(opts.store, addProfile(store, profile));
      console.log(`Profile '${name}' saved (${Object.keys(env).length} keys).`);
    });

  cmd
    .command('apply <name> <envFile>')
    .description('Apply a profile to an env file')
    .option('--no-override', 'Do not override existing keys')
    .option('--store <path>', 'Profile store path', DEFAULT_STORE)
    .action((name: string, envFile: string, opts) => {
      const store = loadStore(opts.store);
      const profile = getProfile(store, name);
      if (!profile) {
        console.error(`Profile '${name}' not found.`);
        process.exit(1);
      }
      const base = fs.existsSync(envFile)
        ? parseEnv(fs.readFileSync(envFile, 'utf-8'))
        : {};
      const result = applyProfile(base, profile, opts.override !== false);
      fs.writeFileSync(envFile, serializeEnv(result));
      console.log(`Profile '${name}' applied to ${envFile}.`);
    });

  cmd
    .command('remove <name>')
    .description('Remove a named profile')
    .option('--store <path>', 'Profile store path', DEFAULT_STORE)
    .action((name: string, opts) => {
      const store = loadStore(opts.store);
      saveStore(opts.store, removeProfile(store, name));
      console.log(`Profile '${name}' removed.`);
    });

  cmd
    .command('list')
    .description('List all saved profiles')
    .option('--store <path>', 'Profile store path', DEFAULT_STORE)
    .action((opts) => {
      const store = loadStore(opts.store);
      console.log(formatProfileResult(listProfiles(store)));
    });
}
