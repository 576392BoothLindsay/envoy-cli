import { collapseEnv, formatCollapseResult } from "./envCollapser";

describe("collapseEnv", () => {
  it("collapses numeric-suffixed keys into a single entry", () => {
    const env = { HOST_1: "a", HOST_2: "b", HOST_3: "c", PORT: "3000" };
    const result = collapseEnv(env);
    expect(result.collapsed["HOSTS"]).toBe("a,b,c");
    expect(result.collapsed["PORT"]).toBe("3000");
    expect(result.collapsed["HOST_1"]).toBeUndefined();
    expect(result.collapsed["HOST_2"]).toBeUndefined();
    expect(result.collapsed["HOST_3"]).toBeUndefined();
  });

  it("uses custom separator", () => {
    const env = { IP_1: "10.0.0.1", IP_2: "10.0.0.2" };
    const result = collapseEnv(env, ";");
    expect(result.collapsed["IPS"]).toBe("10.0.0.1;10.0.0.2");
  });

  it("does not collapse single-entry groups", () => {
    const env = { ONLY_1: "solo" };
    const result = collapseEnv(env);
    expect(result.collapsed["ONLY_1"]).toBe("solo");
    expect(result.collapsed["ONLYS"]).toBeUndefined();
    expect(result.collapsedKeys).toHaveLength(0);
  });

  it("preserves keys that are not numeric-suffixed", () => {
    const env = { FOO: "bar", BAZ: "qux" };
    const result = collapseEnv(env);
    expect(result.collapsed).toEqual({ FOO: "bar", BAZ: "qux" });
    expect(result.collapsedKeys).toHaveLength(0);
  });

  it("handles multiple groups independently", () => {
    const env = { A_1: "x", A_2: "y", B_1: "p", B_2: "q" };
    const result = collapseEnv(env);
    expect(result.collapsed["AS"]).toBe("x,y");
    expect(result.collapsed["BS"]).toBe("p,q");
    expect(result.collapsedKeys).toHaveLength(4);
  });

  it("sorts entries by index before collapsing", () => {
    const env = { NODE_3: "c", NODE_1: "a", NODE_2: "b" };
    const result = collapseEnv(env);
    expect(result.collapsed["NODES"]).toBe("a,b,c");
  });
});

describe("formatCollapseResult", () => {
  it("returns a message when no collapsible keys found", () => {
    const env = { FOO: "bar" };
    const result = collapseEnv(env);
    expect(formatCollapseResult(result)).toBe("No collapsible key groups found.");
  });

  it("formats collapsed keys in output", () => {
    const env = { X_1: "1", X_2: "2" };
    const result = collapseEnv(env);
    const output = formatCollapseResult(result);
    expect(output).toContain("X_1");
    expect(output).toContain("X_2");
    expect(output).toContain("XS=1,2");
  });
});
