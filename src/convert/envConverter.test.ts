import {
  convertEnv,
  toDotenv,
  toJson,
  toYaml,
  toToml,
  toShell,
  toCsv,
  parseConvertFormat,
} from './envConverter';

const sampleEnv = {
  APP_NAME: 'my-app',
  PORT: '3000',
  DEBUG: 'true',
  DATABASE_URL: 'postgres://localhost/db',
};

describe('toDotenv', () => {
  it('converts env record to dotenv format', () => {
    const result = toDotenv(sampleEnv);
    expect(result).toContain('APP_NAME=my-app');
    expect(result).toContain('PORT=3000');
  });
});

describe('toJson', () => {
  it('converts env record to JSON format', () => {
    const result = toJson(sampleEnv);
    const parsed = JSON.parse(result);
    expect(parsed.APP_NAME).toBe('my-app');
    expect(parsed.PORT).toBe('3000');
  });
});

describe('toYaml', () => {
  it('converts env record to YAML format', () => {
    const result = toYaml(sampleEnv);
    expect(result).toContain('APP_NAME: my-app');
    expect(result).toContain('PORT: 3000');
  });

  it('quotes values with special characters', () => {
    const result = toYaml({ KEY: 'value: with colon' });
    expect(result).toContain('"value: with colon"');
  });
});

describe('toToml', () => {
  it('converts env record to TOML format', () => {
    const result = toToml(sampleEnv);
    expect(result).toContain('APP_NAME = "my-app"');
    expect(result).toContain('PORT = "3000"');
  });
});

describe('toShell', () => {
  it('converts env record to shell export format', () => {
    const result = toShell(sampleEnv);
    expect(result).toContain('export APP_NAME="my-app"');
    expect(result).toContain('export PORT="3000"');
  });
});

describe('toCsv', () => {
  it('converts env record to CSV format with header', () => {
    const result = toCsv(sampleEnv);
    const lines = result.split('\n');
    expect(lines[0]).toBe('key,value');
    expect(lines).toContain('APP_NAME,my-app');
  });

  it('wraps values with commas in quotes', () => {
    const result = toCsv({ KEY: 'a,b,c' });
    expect(result).toContain('KEY,"a,b,c"');
  });
});

describe('convertEnv', () => {
  it('returns correct format and keyCount', () => {
    const result = convertEnv(sampleEnv, 'json');
    expect(result.format).toBe('json');
    expect(result.keyCount).toBe(4);
  });

  it('throws for unsupported format', () => {
    expect(() => convertEnv(sampleEnv, 'xml' as any)).toThrow('Unsupported format');
  });
});

describe('parseConvertFormat', () => {
  it('parses valid formats', () => {
    expect(parseConvertFormat('json')).toBe('json');
    expect(parseConvertFormat('yaml')).toBe('yaml');
    expect(parseConvertFormat('csv')).toBe('csv');
  });

  it('throws for invalid format', () => {
    expect(() => parseConvertFormat('xml')).toThrow('Invalid format');
  });
});
