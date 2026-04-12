import { describe, it, expect } from "vitest";
import { parseEnv, serializeEnv, EnvMap } from "./envParser";

describe("parseEnv", () => {
  it("parses simple key=value pairs", () => {
    const map = parseEnv("FOO=bar\nBAZ=qux\n");
    expect(map.get("FOO")?.value).toBe("bar");
    expect(map.get("BAZ")?.value).toBe("qux");
  });

  it("strips inline comments from unquoted values", () => {
    const map = parseEnv("API_KEY=abc123 # secret key\n");
    expect(map.get("API_KEY")?.value).toBe("abc123");
  });

  it("preserves values with spaces when quoted", () => {
    const map = parseEnv('GREETING="hello world"\n');
    expect(map.get("GREETING")?.value).toBe("hello world");
  });

  it("associates preceding comment with the next key", () => {
    const content = "# database url\nDB_URL=postgres://localhost/db\n";
    const map = parseEnv(content);
    expect(map.get("DB_URL")?.comment).toBe("database url");
  });

  it("ignores blank lines and resets pending comment", () => {
    const content = "# orphaned comment\n\nDB_HOST=localhost\n";
    const map = parseEnv(content);
    expect(map.get("DB_HOST")?.comment).toBeUndefined();
  });

  it("handles empty values", () => {
    const map = parseEnv("EMPTY=\n");
    expect(map.get("EMPTY")?.value).toBe("");
  });

  it("handles single-quoted values", () => {
    const map = parseEnv("TOKEN='my-token'\n");
    expect(map.get("TOKEN")?.value).toBe("my-token");
  });
});

describe("serializeEnv", () => {
  it("serializes a map back to env format", () => {
    const map: EnvMap = new Map();
    map.set("FOO", { key: "FOO", value: "bar" });
    map.set("BAZ", { key: "BAZ", value: "qux" });
    const output = serializeEnv(map);
    expect(output).toContain("FOO=bar");
    expect(output).toContain("BAZ=qux");
  });

  it("quotes values containing spaces", () => {
    const map: EnvMap = new Map();
    map.set("MSG", { key: "MSG", value: "hello world" });
    const output = serializeEnv(map);
    expect(output).toContain('MSG="hello world"');
  });

  it("includes comments above keys", () => {
    const map: EnvMap = new Map();
    map.set("PORT", { key: "PORT", value: "3000", comment: "app port" });
    const output = serializeEnv(map);
    expect(output).toContain("# app port\nPORT=3000");
  });
});
