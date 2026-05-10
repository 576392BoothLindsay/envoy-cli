import { flattenEnv2, flattenNestedJson, formatFlatten2Result } from "./envFlattener2";

describe("flattenNestedJson", () => {
  it("flattens a nested object with default separator", () => {
    const result = flattenNestedJson({ a: { b: "1", c: "2" } });
    expect(result).toEqual({ "a_b": "1", "a_c": "2" });
  });

  it("flattens deeply nested object", () => {
    const result = flattenNestedJson({ x: { y: { z: "deep" } } });
    expect(result).toEqual({ "x_y_z": "deep" });
  });

  it("uses custom separator", () => {
    const result = flattenNestedJson({ a: { b: "v" } }, "", ".");
    expect(result).toEqual({ "a.b": "v" });
  });

  it("converts arrays to comma-joined strings", () => {
    const result = flattenNestedJson({ arr: ["x", "y", "z"] });
    expect(result).toEqual({ arr: "x,y,z" });
  });

  it("handles scalar values at root", () => {
    const result = flattenNestedJson("hello", "KEY");
    expect(result).toEqual({ KEY: "hello" });
  });
});

describe("flattenEnv2", () => {
  it("flattens JSON string values", () => {
    const env = { CONFIG: '{"host":"localhost","port":"5432"}' };
    const result = flattenEnv2(env);
    expect(result.flattened).toEqual({
      CONFIG_host: "localhost",
      CONFIG_port: "5432",
    });
  });

  it("keeps non-JSON values as-is", () => {
    const env = { NAME: "envoy", VERSION: "1.0" };
    const result = flattenEnv2(env);
    expect(result.flattened).toEqual({ NAME: "envoy", VERSION: "1.0" });
  });

  it("uses custom separator", () => {
    const env = { DB: '{"host":"localhost"}' };
    const result = flattenEnv2(env, ".");
    expect(result.flattened["DB.host"]).toBe("localhost");
    expect(result.separator).toBe(".");
  });

  it("returns count of flattened keys", () => {
    const env = { A: '{"b":"1","c":"2"}', D: "plain" };
    const result = flattenEnv2(env);
    expect(result.count).toBe(3);
  });

  it("handles empty env", () => {
    const result = flattenEnv2({});
    expect(result.flattened).toEqual({});
    expect(result.count).toBe(0);
  });
});

describe("formatFlatten2Result", () => {
  it("includes separator and key counts", () => {
    const result = flattenEnv2({ A: "1" });
    const formatted = formatFlatten2Result(result);
    expect(formatted).toContain('Separator: "_"');
    expect(formatted).toContain("Keys:");
  });

  it("lists all flattened key=value pairs", () => {
    const result = flattenEnv2({ X: "hello" });
    const formatted = formatFlatten2Result(result);
    expect(formatted).toContain("X=hello");
  });
});
