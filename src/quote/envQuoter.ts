export type QuoteStyle = 'single' | 'double' | 'none' | 'auto';

export interface QuoteOptions {
  style?: QuoteStyle;
  keys?: string[];
  forceAll?: boolean;
}

export interface QuoteResult {
  original: Record<string, string>;
  quoted: Record<string, string>;
  changed: string[];
}

export function quoteValue(value: string, style: QuoteStyle = 'auto'): string {
  if (style === 'none') return value;

  const needsQuoting = /\s|#|=|\$|`|'|"|\\/.test(value) || value === '';

  if (style === 'auto' && !needsQuoting) return value;

  const effectiveStyle = style === 'auto' ? 'double' : style;

  if (effectiveStyle === 'double') {
    const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  } else {
    const escaped = value.replace(/'/g, "'\\''" );
    return `'${escaped}'`;
  }
}

export function unquoteValue(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/'\\''/g, "'");
  }
  return value;
}

export function quoteEnv(
  env: Record<string, string>,
  options: QuoteOptions = {}
): QuoteResult {
  const { style = 'auto', keys, forceAll = false } = options;
  const quoted: Record<string, string> = {};
  const changed: string[] = [];

  for (const [key, value] of Object.entries(env)) {
    const shouldQuote = forceAll || !keys || keys.includes(key);
    if (shouldQuote) {
      const newValue = quoteValue(value, style);
      quoted[key] = newValue;
      if (newValue !== value) changed.push(key);
    } else {
      quoted[key] = value;
    }
  }

  return { original: env, quoted, changed };
}

export function formatQuoteResult(result: QuoteResult): string {
  if (result.changed.length === 0) {
    return 'No values needed quoting.';
  }
  const lines = result.changed.map(
    (key) => `  ${key}: ${result.original[key] || '(empty)'} → ${result.quoted[key]}`
  );
  return `Quoted ${result.changed.length} value(s):\n${lines.join('\n')}`;
}
