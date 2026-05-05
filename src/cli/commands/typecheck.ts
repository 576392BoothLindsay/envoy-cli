import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnv } from '../../parser/envParser';
import { typecheckEnv, formatTypecheckResult, EnvTypeSchema, EnvTypeRule } from '../../typecheck/envTypeChecker';

function loadTypeSchema(schemaPath: string): EnvTypeSchema {
  const raw = fs.readFileSync(schemaPath, 'utf-8');
  const parsed = JSON.parse(raw);
  const schema: EnvTypeSchema = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'string') {
      schema[key] = { type: value as EnvTypeRule['type'] };
    } else {
      schema[key] = value as EnvTypeRule;
    }
  }
  return schema;
}

export function registerTypecheckCommand(program: Command): void {
  program
    .command('typecheck <envFile>')
    .description('Validate .env values against a type schema')
    .requiredOption('-s, --schema <schemaFile>', 'Path to JSON type schema file')
    .option('--json', 'Output result as JSON')
    .action((envFile: string, options: { schema: string; json?: boolean }) => {
      if (!fs.existsSync(envFile)) {
        console.error(`Error: env file not found: ${envFile}`);
        process.exit(1);
      }
      if (!fs.existsSync(options.schema)) {
        console.error(`Error: schema file not found: ${options.schema}`);
        process.exit(1);
      }

      const raw = fs.readFileSync(envFile, 'utf-8');
      const env = parseEnv(raw);
      const schema = loadTypeSchema(options.schema);
      const result = typecheckEnv(env, schema);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(formatTypecheckResult(result));
      }

      if (!result.valid) process.exit(1);
    });
}
