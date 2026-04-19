export type BoundaryResult = {
  key: string;
  value: string;
  withinBounds: boolean;
  reason?: string;
};

export type BoundaryRule = {
  min?: number;
  max?: number;
  pattern?: RegExp;
};

export type BoundaryRules = Record<string, BoundaryRule>;

export function checkBoundary(key: string, value: string, rule: BoundaryRule): BoundaryResult {
  const len = value.length;

  if (rule.min !== undefined && len < rule.min) {
    return { key, value, withinBounds: false, reason: `length ${len} is below minimum ${rule.min}` };
  }

  if (rule.max !== undefined && len > rule.max) {
    return { key, value, withinBounds: false, reason: `length ${len} exceeds maximum ${rule.max}` };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return { key, value, withinBounds: false, reason: `value does not match pattern ${rule.pattern}` };
  }

  return { key, value, withinBounds: true };
}

export function checkBoundaries(
  env: Record<string, string>,
  rules: BoundaryRules
): BoundaryResult[] {
  return Object.entries(env).map(([key, value]) => {
    const rule = rules[key];
    if (!rule) return { key, value, withinBounds: true };
    return checkBoundary(key, value, rule);
  });
}

export function formatBoundaryResult(results: BoundaryResult[]): string {
  const violations = results.filter((r) => !r.withinBounds);
  if (violations.length === 0) return 'All values are within bounds.';
  const lines = violations.map((r) => `  ${r.key}: ${r.reason}`);
  return `Boundary violations (${violations.length}):\n${lines.join('\n')}`;
}
