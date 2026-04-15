import { Argv } from 'yargs';
import * as fs from 'fs';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { pinKeys, applyPins, removePins, formatPinResult, PinStore } from '../../pin/envPin';

const DEFAULT_PIN_FILE = '.env.pins.json';

function loadPinStore(pinFile: string): PinStore {
  if (fs.existsSync(pinFile)) {
    return JSON.parse(fs.readFileSync(pinFile, 'utf-8')) as PinStore;
  }
  return { pins: [] };
}

function savePinStore(pinFile: string, store: PinStore): void {
  fs.writeFileSync(pinFile, JSON.stringify(store, null, 2), 'utf-8');
}

export function registerPinCommand(yargs: Argv): void {
  yargs.command(
    'pin <subcommand>',
    'Pin, unpin, or apply pinned env values',
    (y) =>
      y
        .command(
          'add <file> <keys..>',
          'Pin specific keys from an env file',
          (sub) =>
            sub
              .positional('file', { type: 'string', demandOption: true })
              .positional('keys', { type: 'string', array: true, demandOption: true })
              .option('pin-file', { type: 'string', default: DEFAULT_PIN_FILE })
              .option('env', { type: 'string', description: 'Environment label' }),
          (argv) => {
            const raw = fs.readFileSync(argv.file as string, 'utf-8');
            const env = parseEnv(raw);
            const store = loadPinStore(argv['pin-file'] as string);
            const { store: updated, result } = pinKeys(env, argv.keys as string[], argv.env as string | undefined);
            updated.pins = [...store.pins.filter((p) => !(argv.keys as string[]).includes(p.key)), ...updated.pins];
            savePinStore(argv['pin-file'] as string, updated);
            console.log(formatPinResult(result));
          }
        )
        .command(
          'remove <keys..>',
          'Unpin specific keys',
          (sub) =>
            sub
              .positional('keys', { type: 'string', array: true, demandOption: true })
              .option('pin-file', { type: 'string', default: DEFAULT_PIN_FILE }),
          (argv) => {
            const store = loadPinStore(argv['pin-file'] as string);
            const { store: updated, result } = removePins(store, argv.keys as string[]);
            savePinStore(argv['pin-file'] as string, updated);
            console.log(formatPinResult(result));
          }
        )
        .command(
          'apply <file>',
          'Apply pinned values to an env file',
          (sub) =>
            sub
              .positional('file', { type: 'string', demandOption: true })
              .option('pin-file', { type: 'string', default: DEFAULT_PIN_FILE })
              .option('output', { type: 'string', description: 'Output file (defaults to input file)' }),
          (argv) => {
            const raw = fs.readFileSync(argv.file as string, 'utf-8');
            const env = parseEnv(raw);
            const store = loadPinStore(argv['pin-file'] as string);
            const result = applyPins(env, store);
            const out = argv.output as string | undefined ?? argv.file as string;
            fs.writeFileSync(out, serializeEnv(result), 'utf-8');
            console.log(`Applied ${store.pins.length} pin(s) to ${out}`);
          }
        )
        .demandCommand(1, 'Specify a pin subcommand: add, remove, apply'),
    () => {}
  );
}
