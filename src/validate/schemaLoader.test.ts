import * as fs from 'fs';
import * as path from 'path';
import { loadSchema, schemaExists, defaultSchemaPath } from './schemaLoader';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('loadSchema', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('throws if schema file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(() => loadSchema('/fake/path.json')).toThrow('Schema file not found');
  });

  it('throws on invalid JSON', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue('not-json' as unknown as Buffer);
    expect(() => loadSchema('/fake/path.json')).toThrow('Invalid JSON');
  });

  it('throws if schema lacks rules array', () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify({ notRules: [] }) as unknown as Buffer);
    expect(() => loadSchema('/fake/path.json')).toThrow('must contain a "rules" array');
  });

  it('returns parsed schema with rules', () => {
    const schema = { rules: [{ key: 'DATABASE_URL', required: true }] };
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(schema) as unknown as Buffer);
    const result = loadSchema('/fake/path.json');
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].key).toBe('DATABASE_URL');
  });
});

describe('schemaExists', () => {
  it('returns true when schema file exists', () => {
    mockFs.existsSync.mockReturnValue(true);
    expect(schemaExists('/some/path.json')).toBe(true);
  });

  it('returns false when schema file does not exist', () => {
    mockFs.existsSync.mockReturnValue(false);
    expect(schemaExists('/some/path.json')).toBe(false);
  });
});

describe('defaultSchemaPath', () => {
  it('returns path ending with .env.schema.json', () => {
    const p = defaultSchemaPath();
    expect(p.endsWith('.env.schema.json')).toBe(true);
  });
});
