import type { Argv } from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv, serializeEnv } from '../../parser/envParser';
import { encryptEnv, decryptEnv, formatEncryptResult } from '../../encrypt/envEncrypt';

export function registerEncryptCommand(yargs: Argv): Argv {
  return yargs
    .command(
      'encrypt <file>',
      'Encrypt values in a .env file',
      (y) =>
        y
          .positional('file', { type: 'string', description: '.env file to encrypt', demandOption: true })
          .option('passphrase', { alias: 'p', type: 'string', description: 'Encryption passphrase', demandOption: true })
          .option('keys', { alias: 'k', type: 'array', string: true, description: 'Specific keys to encrypt' })
          .option('output', { alias: 'o', type: 'string', description: 'Output file (defaults to input file)' })
          .option('decrypt', { alias: 'd', type: 'boolean', default: false, description: 'Decrypt instead of encrypt' }),
      (argv) => {
        const filePath = path.resolve(argv.file as string);
        if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          process.exit(1);
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const env = parseEnv(raw);
        const passphrase = argv.passphrase as string;
        const outputPath = argv.output ? path.resolve(argv.output as string) : filePath;

        if (argv.decrypt) {
          const decrypted = decryptEnv(env, passphrase);
          fs.writeFileSync(outputPath, serializeEnv(decrypted), 'utf8');
          console.log(`Decrypted env written to ${outputPath}`);
        } else {
          const keys = argv.keys as string[] | undefined;
          const result = encryptEnv(env, passphrase, keys);
          fs.writeFileSync(outputPath, serializeEnv(result.encrypted), 'utf8');
          console.log(formatEncryptResult(result));
          console.log(`Encrypted env written to ${outputPath}`);
        }
      }
    );
}
