export type HighlightTheme = 'ansi' | 'html' | 'plain';

export interface HighlightOptions {
  theme?: HighlightTheme;
  highlightKeys?: string[];
  highlightValues?: string[];
  dimComments?: boolean;
}

export interface HighlightResult {
  output: string;
  matchedKeys: string[];
  matchedValues: string[];
}

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

export function highlightLine(
  line: string,
  theme: HighlightTheme,
  matchedKey: boolean,
  matchedValue: boolean,
  isComment: boolean,
  dimComments: boolean
): string {
  if (theme === 'plain') return line;

  if (theme === 'ansi') {
    if (isComment) {
      return dimComments ? `${ANSI.dim}${line}${ANSI.reset}` : line;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return line;
    const key = line.slice(0, eqIdx);
    const value = line.slice(eqIdx + 1);
    const keyPart = matchedKey
      ? `${ANSI.bold}${ANSI.yellow}${key}${ANSI.reset}`
      : `${ANSI.cyan}${key}${ANSI.reset}`;
    const valuePart = matchedValue
      ? `${ANSI.bold}${ANSI.magenta}${value}${ANSI.reset}`
      : `${ANSI.green}${value}${ANSI.reset}`;
    return `${keyPart}=${valuePart}`;
  }

  if (theme === 'html') {
    if (isComment) {
      const escaped = escapeHtml(line);
      return dimComments
        ? `<span class="env-comment dim">${escaped}</span>`
        : `<span class="env-comment">${escaped}</span>`;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return escapeHtml(line);
    const key = escapeHtml(line.slice(0, eqIdx));
    const value = escapeHtml(line.slice(eqIdx + 1));
    const keyClass = matchedKey ? 'env-key highlight' : 'env-key';
    const valueClass = matchedValue ? 'env-value highlight' : 'env-value';
    return `<span class="${keyClass}">${key}</span>=<span class="${valueClass}">${value}</span>`;
  }

  return line;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightEnv(
  raw: string,
  options: HighlightOptions = {}
): HighlightResult {
  const { theme = 'ansi', highlightKeys = [], highlightValues = [], dimComments = true } = options;
  const matchedKeySet = new Set<string>();
  const matchedValueSet = new Set<string>();

  const lines = raw.split('\n');
  const outputLines = lines.map((line) => {
    const trimmed = line.trim();
    const isComment = trimmed.startsWith('#');
    if (isComment || trimmed === '') {
      return highlightLine(line, theme, false, false, isComment, dimComments);
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return line;
    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();
    const matchedKey = highlightKeys.length > 0 && highlightKeys.includes(key);
    const matchedValue = highlightValues.length > 0 && highlightValues.includes(value);
    if (matchedKey) matchedKeySet.add(key);
    if (matchedValue) matchedValueSet.add(value);
    return highlightLine(line, theme, matchedKey, matchedValue, false, dimComments);
  });

  return {
    output: outputLines.join('\n'),
    matchedKeys: Array.from(matchedKeySet),
    matchedValues: Array.from(matchedValueSet),
  };
}

export function formatHighlightResult(result: HighlightResult): string {
  return result.output;
}
