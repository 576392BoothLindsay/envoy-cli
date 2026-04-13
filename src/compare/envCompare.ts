import { EnvRecord } from '../parser/envParser';

export type CompareResult = {
  matching: string[];
  missingInTarget: string[];
  extraInTarget: string[];
  valueConflicts: Array<{ key: string; sourceValue: string; targetValue: string }>;
  summary: {
    total: number;
    matching: number;
    conflicts: number;
    missing: number;
    extra: number;
  };
};

export function compareEnvs(
  source: EnvRecord,
  target: EnvRecord
): CompareResult {
  const sourceKeys = new Set(Object.keys(source));
  const targetKeys = new Set(Object.keys(target));

  const matching: string[] = [];
  const valueConflicts: CompareResult['valueConflicts'] = [];
  const missingInTarget: string[] = [];
  const extraInTarget: string[] = [];

  for (const key of sourceKeys) {
    if (!targetKeys.has(key)) {
      missingInTarget.push(key);
    } else if (source[key] === target[key]) {
      matching.push(key);
    } else {
      valueConflicts.push({
        key,
        sourceValue: source[key],
        targetValue: target[key],
      });
    }
  }

  for (const key of targetKeys) {
    if (!sourceKeys.has(key)) {
      extraInTarget.push(key);
    }
  }

  const total = sourceKeys.size;

  return {
    matching,
    missingInTarget,
    extraInTarget,
    valueConflicts,
    summary: {
      total,
      matching: matching.length,
      conflicts: valueConflicts.length,
      missing: missingInTarget.length,
      extra: extraInTarget.length,
    },
  };
}

export function formatCompareResult(result: CompareResult): string {
  const lines: string[] = [];

  lines.push(`Summary: ${result.summary.total} keys in source`);
  lines.push(`  ✔ Matching:          ${result.summary.matching}`);
  lines.push(`  ✖ Conflicts:         ${result.summary.conflicts}`);
  lines.push(`  - Missing in target: ${result.summary.missing}`);
  lines.push(`  + Extra in target:   ${result.summary.extra}`);

  if (result.valueConflicts.length > 0) {
    lines.push('');
    lines.push('Value conflicts:');
    for (const conflict of result.valueConflicts) {
      lines.push(`  ${conflict.key}`);
      lines.push(`    source: ${conflict.sourceValue}`);
      lines.push(`    target: ${conflict.targetValue}`);
    }
  }

  if (result.missingInTarget.length > 0) {
    lines.push('');
    lines.push('Missing in target:');
    for (const key of result.missingInTarget) {
      lines.push(`  - ${key}`);
    }
  }

  if (result.extraInTarget.length > 0) {
    lines.push('');
    lines.push('Extra in target:');
    for (const key of result.extraInTarget) {
      lines.push(`  + ${key}`);
    }
  }

  return lines.join('\n');
}
