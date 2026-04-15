import {
  convertEnv,
  toDotenv,
  toJson,
  toYaml,
  toToml,
  parseConvertFormat,
  formatConvertResult,
} from './envConverter';

const sampleEnv = {
  APP_NAME: 'myapp',
  PORT: '3000',
  DB_URL: 'postgres://localhost/db',
};

describe('convertEnv', () => {
  it('converts to dotenv format', () => {
    const result = convertEnv(sampleEnv, 'dotenv');
    expect(result.format).toBe('dotenv');
    expect(result.keyCount).toBe(3);
    expect(result.output).toContain('APP_NAME=myapp');
  });

  it('converts to json format', () => {
    const result = convertEnv(sampleEnv, 'json');
    expect(result.format).toBe('json');
    const parsed = JSON.parse(result.output);
    expect(parsed.APP_NAME).toBe('myapp');
  });

  it('converts to yaml format', () => {
    const result = convertEnv(sampleEnv, 'yaml');
    expect(result.output).toContain('APP_NAME: myapp');
    expect(result.output).toContain('PORT: 3000');
  });

  it('converts to toml format', () => {
    const result = convertEnv(sampleEnv, 'toml');
    expect(result.output).toContain('APP_NAME = "myapp"');
  });

  it('throws on unsupported format', () => {
    expect(() => convertEnv(sampleEnv, 'xml' as any)).toThrow('Unsupported format');
  });
});

describe('toYaml', () => {
  it('quotes values with special characters', () => {
    const result = toYaml({ KEY: 'value: with colon' });
    expect(result).toBe('KEY: "value: with colon"');
  });

  it('does not quote plain values', () => {
    const result = toYaml({ SIMPLE: 'hello' });
    expect(result).toBe('SIMPLE: hello');
  });
});

describe('toToml', () => {
  it('escapes double quotes in values', () => {
    const result = toToml({ KEY: 'say "hello"' });
    expect(result).toContain('KEY = "say \\"hello\\""');
  });
});

describe('parseConvertFormat', () => {
  it('parses valid formats case-insensitively', () => {
    expect(parseConvertFormat('JSON')).toBe('json');
    expect(parseConvertFormat('YAML')).toBe('yaml');
    expect(parseConvertFormat('dotenv')).toBe('dotenv');
    expect(parseConvertFormat('TOML')).toBe('toml');
  });

  it('throws on invalid format', () => {
    expect(() => parseConvertFormat('xml')).toThrow('Invalid format');
  });
});

describe('formatConvertResult', () => {
  it('includes key count and format in output', () => {
    const result = convertEnv(sampleEnv, 'json');
    const formatted = formatConvertResult(result);
    expect(formatted).toContain('3 key(s)');
    expect(formatted).toContain('json format');
  });
});
