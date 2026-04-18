export type NormalizeOptions = {
  trimKeys?: boolean;
  trimValues?: boolean;
  uppercaseKeys?: boolean;
  removeEmpty?: boolean;
  removeComments?: boolean;
};

export type NormalizeResult = {
  original: Record<string, string>;
  normalized: Record<string, string>;
  changes: { key: string; change: string }[];
};

export function normalizeEnv(
  env: Record<string, string>,
  options: NormalizeOptions = {}
): NormalizeResult {
  const {
    trimKeys = true,
    trimValues = true,
    uppercaseKeys = false,
    removeEmpty = false,
    removeComments = true,
  } = options;

  const normalized: Record<string, string> = {};
  const changes: { key: string; change: string }[] = [];

  for (const [rawKey, rawValue] of Object.entries(env)) {
    let key = rawKey;
    let value = rawValue;

    if (trimKeys && key !== key.trim()) {
      changes.push({ key, change: `trimmed key whitespace` });
      key = key.trim();
    }

    if (uppercaseKeys && key !== key.toUpperCase()) {
      changes.push({ key, change: `uppercased key` });
      key = key.toUpperCase();
    }

    if (trimValues && value !== value.trim()) {
      changes.push({ key, change: `trimmed value whitespace` });
      value = value.trim();
    }

    if (removeComments) {
      const withoutComment = value.replace(/\s+#.*$/, '');
      if (withoutComment !== value) {
        changes.push({ key, change: `removed inline comment` });
        value = withoutComment;
      }
    }

    if (removeEmpty && value === '') {
      changes.push({ key, change: `removed empty key` });
      continue;
    }

    normalized[key] = value;
  }

  return { original: env, normalized, changes };
}

export function formatNormalizeResult(result: NormalizeResult): string {
  if (result.changes.length === 0) {
    return 'No changes made during normalization.';
  }
  const lines = result.changes.map(c => `  ${c.key}: ${c.change}`);
  return `Normalized ${result.changes.length} change(s):\n${lines.join('\n')}`;
}
