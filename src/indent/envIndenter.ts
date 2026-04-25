import { EnvRecord } from '../parser/envParser';

export type IndentStyle = 'space' | 'tab';

export interface IndentOptions {
  style?: IndentStyle;
  size?: number;
  groupByPrefix?: boolean;
}

export interface IndentResult {
  output: string;
  groupCount: number;
  keyCount: number;
}

export function indentEnv(
  env: EnvRecord,
  options: IndentOptions = {}
): IndentResult {
  const { style = 'space', size = 2, groupByPrefix = false } = options;
  const indent = style === 'tab' ? '\t'.repeat(size) : ' '.repeat(size);
  const keys = Object.keys(env);

  if (!groupByPrefix) {
    const lines = keys.map((key) => `${indent}${key}=${env[key]}`);
    return {
      output: lines.join('\n'),
      groupCount: 1,
      keyCount: keys.length,
    };
  }

  const groups: Record<string, string[]> = {};
  for (const key of keys) {
    const prefix = key.includes('_') ? key.split('_')[0] : '__ungrouped__';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }

  const lines: string[] = [];
  for (const [group, groupKeys] of Object.entries(groups)) {
    if (group !== '__ungrouped__') {
      lines.push(`# ${group}`);
    }
    for (const key of groupKeys) {
      lines.push(`${indent}${key}=${env[key]}`);
    }
    lines.push('');
  }

  return {
    output: lines.join('\n').trimEnd(),
    groupCount: Object.keys(groups).length,
    keyCount: keys.length,
  };
}

export function formatIndentResult(result: IndentResult): string {
  return [
    result.output,
    '',
    `# Indented ${result.keyCount} key(s) across ${result.groupCount} group(s).`,
  ].join('\n');
}
