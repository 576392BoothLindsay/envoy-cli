import {
  recaseKey,
  recaseEnv,
  toCamelCase,
  toSnakeCase,
  toPascalCase,
  toKebabCase,
  toConstantCase,
} from './envRecaser';

describe('toCamelCase', () => {
  it('converts snake_case to camelCase', () => {
    expect(toCamelCase('MY_API_KEY')).toBe('myApiKey');
  });

  it('converts kebab-case to camelCase', () => {
    expect(toCamelCase('my-api-key')).toBe('myApiKey');
  });
});

describe('toSnakeCase', () => {
  it('converts camelCase to SNAKE_CASE', () => {
    expect(toSnakeCase('myApiKey')).toBe('MY_API_KEY');
  });

  it('converts kebab-case to SNAKE_CASE', () => {
    expect(toSnakeCase('my-api-key')).toBe('MY_API_KEY');
  });
});

describe('toPascalCase', () => {
  it('converts snake_case to PascalCase', () => {
    expect(toPascalCase('my_api_key')).toBe('MyApiKey');
  });
});

describe('toKebabCase', () => {
  it('converts SNAKE_CASE to kebab-case', () => {
    expect(toKebabCase('MY_API_KEY')).toBe('my_api_key'.replace(/_/g, '-'));
  });

  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('myApiKey')).toBe('my-api-key');
  });
});

describe('toConstantCase', () => {
  it('converts camelCase to CONSTANT_CASE', () => {
    expect(toConstantCase('myApiKey')).toBe('MY_API_KEY');
  });
});

describe('recaseKey', () => {
  it('applies the correct strategy', () => {
    expect(recaseKey('MY_KEY', 'camel')).toBe('myKey');
    expect(recaseKey('myKey', 'constant')).toBe('MY_KEY');
  });
});

describe('recaseEnv', () => {
  const env = { MY_API_KEY: 'abc', DB_HOST: 'localhost' };

  it('recases all keys with camel strategy', () => {
    const result = recaseEnv(env, 'camel');
    expect(result.recased).toHaveProperty('myApiKey', 'abc');
    expect(result.recased).toHaveProperty('dbHost', 'localhost');
  });

  it('tracks changed keys', () => {
    const result = recaseEnv(env, 'camel');
    expect(result.changed).toContain('MY_API_KEY');
    expect(result.changed).toContain('DB_HOST');
  });

  it('returns unchanged keys when already correct case', () => {
    const alreadyCamel = { myApiKey: 'abc' };
    const result = recaseEnv(alreadyCamel, 'camel');
    expect(result.changed).not.toContain('myApiKey');
  });
});
