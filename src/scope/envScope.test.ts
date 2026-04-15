import {
  extractScope,
  splitByScopes,
  flattenScope,
  formatScopeResult,
} from "./envScope";

const sampleEnv = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  REDIS_HOST: "127.0.0.1",
  REDIS_PORT: "6379",
  APP_NAME: "envoy",
  NODE_ENV: "test",
};

describe("extractScope", () => {
  it("extracts keys matching a scope prefix", () => {
    const result = extractScope(sampleEnv, "DB");
    expect(result.scope).toBe("DB");
    expect(result.keys).toContain("DB_HOST");
    expect(result.keys).toContain("DB_PORT");
    expect(result.keys).not.toContain("REDIS_HOST");
    expect(result.env["DB_HOST"]).toBe("localhost");
  });

  it("returns empty env when no keys match", () => {
    const result = extractScope(sampleEnv, "S3");
    expect(result.keys).toHaveLength(0);
    expect(result.env).toEqual({});
  });

  it("is case-insensitive for scope name", () => {
    const result = extractScope(sampleEnv, "redis");
    expect(result.keys).toContain("REDIS_HOST");
    expect(result.keys).toContain("REDIS_PORT");
  });
});

describe("splitByScopes", () => {
  it("splits env into multiple scopes and unscoped", () => {
    const result = splitByScopes(sampleEnv, ["DB", "REDIS"]);
    expect(result.scopes).toHaveLength(2);
    expect(result.scopes[0].scope).toBe("DB");
    expect(result.scopes[1].scope).toBe("REDIS");
    expect(Object.keys(result.unscoped)).toContain("APP_NAME");
    expect(Object.keys(result.unscoped)).toContain("NODE_ENV");
  });

  it("places all keys in unscoped when no scopes match", () => {
    const result = splitByScopes(sampleEnv, ["S3"]);
    expect(Object.keys(result.unscoped)).toHaveLength(6);
  });
});

describe("flattenScope", () => {
  it("returns env unchanged when no new prefix given", () => {
    const scopeResult = extractScope(sampleEnv, "DB");
    const flat = flattenScope(scopeResult);
    expect(flat).toEqual(scopeResult.env);
  });

  it("renames prefix when newPrefix is provided", () => {
    const scopeResult = extractScope(sampleEnv, "DB");
    const flat = flattenScope(scopeResult, "PG");
    expect(flat["PG_HOST"]).toBe("localhost");
    expect(flat["PG_PORT"]).toBe("5432");
    expect(flat["DB_HOST"]).toBeUndefined();
  });
});

describe("formatScopeResult", () => {
  it("formats scope result into readable string", () => {
    const result = splitByScopes(sampleEnv, ["DB"]);
    const output = formatScopeResult(result);
    expect(output).toContain("[DB]");
    expect(output).toContain("DB_HOST=localhost");
    expect(output).toContain("[unscoped]");
  });
});
