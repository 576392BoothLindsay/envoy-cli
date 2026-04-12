/**
 * Parses .env file content into a key-value record,
 * supporting comments, blank lines, and quoted values.
 */

export interface EnvEntry {
  key: string;
  value: string;
  comment?: string;
}

export type EnvMap = Map<string, EnvEntry>;

const COMMENT_RE = /^\s*#(.*)$/;
const KEY_VALUE_RE = /^\s*([\w.\-]+)\s*=\s*(.*)?$/;
const QUOTED_RE = /^(['"`])(.*?)\1$/s;

export function parseEnv(content: string): EnvMap {
  const map: EnvMap = new Map();
  const lines = content.split(/\r?\n/);
  let pendingComment: string | undefined;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      pendingComment = undefined;
      continue;
    }

    const commentMatch = trimmed.match(COMMENT_RE);
    if (commentMatch) {
      pendingComment = commentMatch[1].trim();
      continue;
    }

    const kvMatch = trimmed.match(KEY_VALUE_RE);
    if (kvMatch) {
      const key = kvMatch[1];
      let raw = (kvMatch[2] ?? "").trim();

      // Strip inline comments (unquoted values)
      const quotedMatch = raw.match(QUOTED_RE);
      if (quotedMatch) {
        raw = quotedMatch[2];
      } else {
        const inlineComment = raw.indexOf(" #");
        if (inlineComment !== -1) {
          raw = raw.slice(0, inlineComment).trim();
        }
      }

      map.set(key, {
        key,
        value: raw,
        comment: pendingComment,
      });

      pendingComment = undefined;
    }
  }

  return map;
}

export function serializeEnv(map: EnvMap): string {
  const lines: string[] = [];

  for (const entry of map.values()) {
    if (entry.comment) {
      lines.push(`# ${entry.comment}`);
    }
    const needsQuotes = /\s|#/.test(entry.value);
    const value = needsQuotes ? `"${entry.value}"` : entry.value;
    lines.push(`${entry.key}=${value}`);
  }

  return lines.join("\n") + "\n";
}
