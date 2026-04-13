import * as fs from 'fs';
import * as path from 'path';
import { ValidationRule } from './envValidator';

export interface EnvSchema {
  rules: ValidationRule[];
}

export function loadSchema(schemaPath: string): EnvSchema {
  const resolved = path.resolve(schemaPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Schema file not found: ${resolved}`);
  }

  const raw = fs.readFileSync(resolved, 'utf-8');
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in schema file: ${resolved}`);
  }

  if (!isEnvSchema(parsed)) {
    throw new Error(`Schema file must contain a "rules" array: ${resolved}`);
  }

  return parsed;
}

function isEnvSchema(obj: unknown): obj is EnvSchema {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'rules' in obj &&
    Array.isArray((obj as EnvSchema).rules)
  );
}

export function defaultSchemaPath(): string {
  return path.join(process.cwd(), '.env.schema.json');
}

export function schemaExists(schemaPath?: string): boolean {
  const target = schemaPath ?? defaultSchemaPath();
  return fs.existsSync(path.resolve(target));
}
