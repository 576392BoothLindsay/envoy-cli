export interface Annotation {
  key: string;
  comment: string;
}

export interface AnnotateResult {
  annotated: Record<string, string>;
  comments: Record<string, string>;
  count: number;
}

export function addAnnotation(
  env: Record<string, string>,
  key: string,
  comment: string
): AnnotateResult {
  const comments: Record<string, string> = { [key]: comment };
  return buildAnnotateResult(env, comments);
}

export function addAnnotations(
  env: Record<string, string>,
  annotations: Annotation[]
): AnnotateResult {
  const comments: Record<string, string> = {};
  for (const { key, comment } of annotations) {
    if (key in env) {
      comments[key] = comment;
    }
  }
  return buildAnnotateResult(env, comments);
}

export function removeAnnotation(
  comments: Record<string, string>,
  key: string
): Record<string, string> {
  const result = { ...comments };
  delete result[key];
  return result;
}

export function serializeWithAnnotations(
  env: Record<string, string>,
  comments: Record<string, string>
): string {
  return Object.entries(env)
    .map(([k, v]) => {
      const comment = comments[k];
      return comment ? `# ${comment}\n${k}=${v}` : `${k}=${v}`;
    })
    .join('\n');
}

function buildAnnotateResult(
  env: Record<string, string>,
  comments: Record<string, string>
): AnnotateResult {
  return {
    annotated: { ...env },
    comments,
    count: Object.keys(comments).length,
  };
}

export function formatAnnotateResult(result: AnnotateResult): string {
  if (result.count === 0) return 'No annotations added.';
  const lines = Object.entries(result.comments).map(
    ([k, c]) => `  ${k}: "${c}"`
  );
  return `Annotated ${result.count} key(s):\n${lines.join('\n')}`;
}
