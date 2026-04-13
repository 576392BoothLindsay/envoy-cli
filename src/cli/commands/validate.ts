import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnv } from '../../parser/envParser';
import { validateEnv, formatValidationErrors } from '../../validate/envValidator';
import { loadSchema, schemaExists, defaultSchemaPath } from '../../validate/schemaLoader';

export function registerValidateCommand(program: Command): void {
  program
    .command('validate <envFile>')
    .description('Validate a .env file against a schema')
    .option('--schema <path>', 'Path to schema file', defaultSchemaPath)
    .action((envFile: string, options: { schema: string }) => {
      const envPath = path.resolve(process.cwd(), envFile);
      const schemaPath = path.resolve(process.cwd(), options.schema);

      if (!fs.existsSync(envPath)) {
        console.error(`Error: Env file not found: ${envPath}`);
        process.exit(1);
      }

      if (!schemaExists(schemaPath)) {
        console.error(`Error: Schema file not found: ${schemaPath}`);
        process.exit(1);
      }

      const env = parseEnv(fs.readFileSync(envPath, 'utf-8'));
      const schema = loadSchema(schemaPath);
      const result = validateEnv(env, schema);

      if (result.valid) {
        console.log(`✔ ${envFile} is valid.`);
      } else {
        console.error(`✖ ${envFile} has validation errors:`);
        console.error(formatValidationErrors(result.errors));
        process.exit(1);
      }
    });
}
