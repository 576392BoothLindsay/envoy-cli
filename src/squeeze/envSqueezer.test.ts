import {
  isBlankValue,
  squeezeEnv,
  getBlankKeys,
  buildSqueezeResult,
  formatSqueezeResult,
} from "./envSqueezer";

describe("isBlankValue", () => {
  it("returns true for empty string", () => {
    expect(isBlankValue("")).toBe(true);
  });

  it("returns true for whitespace-only string", () => {
    expect(isBlankValue("   ")).toBe(true);
    expect(isBlankValue("\t")).toBe(true);
  });

  it("returns false for non-empty value", () => {
    expect(isBlankValue("hello")).toBe(false);
    expect(isBlankValue(" x ")).toBe(false);
  });
});

describe("squeezeEnv", () => {
  it("removes keys with empty values", () => {
    const env = { A: "1", B: "", C: "3" };
    expect(squeezeEnv(env)).toEqual({ A: "1", C: "3" });
  });

  it("removes keys with whitespace-only values", () => {
    const env = { X: "  ", Y: "value" };
    expect(squeezeEnv(env)).toEqual({ Y: "value" });
  });

  it("returns all keys when none are blank", () => {
    const env = { A: "1", B: "2" };
    expect(squeezeEnv(env)).toEqual({ A: "1", B: "2" });
  });

  it("returns empty object when all are blank", () => {
    const env = { A: "", B: " " };
    expect(squeezeEnv(env)).toEqual({});
  });
});

describe("getBlankKeys", () => {
  it("returns keys with blank values", () => {
    const env = { A: "", B: "ok", C: "  " };
    expect(getBlankKeys(env)).toEqual(["A", "C"]);
  });

  it("returns empty array when no blank keys", () => {
    expect(getBlankKeys({ A: "1" })).toEqual([]);
  });
});

describe("buildSqueezeResult", () => {
  it("builds correct result metadata", () => {
    const env = { A: "1", B: "", C: "3" };
    const result = buildSqueezeResult(env);
    expect(result.removedKeys).toEqual(["B"]);
    expect(result.removedCount).toBe(1);
    expect(result.squeezed).toEqual({ A: "1", C: "3" });
    expect(result.original).toBe(env);
  });
});

describe("formatSqueezeResult", () => {
  it("reports no blank entries when none exist", () => {
    const result = buildSqueezeResult({ A: "1", B: "2" });
    const output = formatSqueezeResult(result);
    expect(output).toContain("No blank entries found.");
    expect(output).toContain("Remaining keys: 2");
  });

  it("lists removed keys", () => {
    const result = buildSqueezeResult({ A: "", B: "val", C: " " });
    const output = formatSqueezeResult(result);
    expect(output).toContain("Removed 2 blank entries");
    expect(output).toContain("- A");
    expect(output).toContain("- C");
    expect(output).toContain("Remaining keys: 1");
  });

  it("uses singular form for one removed entry", () => {
    const result = buildSqueezeResult({ A: "", B: "ok" });
    const output = formatSqueezeResult(result);
    expect(output).toContain("Removed 1 blank entry:");
  });
});
