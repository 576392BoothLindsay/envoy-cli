import { EnvRecord } from '../parser/envParser';

export type PatchOperation =
  | { op: 'set'; key: string; value: string }
  | { op: 'delete'; key: string }
  | { op: 'rename'; from: string; to: string };

export interface PatchResult {
  patched: EnvRecord;
  applied: PatchOperation[];
  skipped: PatchOperation[];
}

export function applyPatch(
  env: EnvRecord,
  operations: PatchOperation[]
): PatchResult {
  const patched: EnvRecord = { ...env };
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of operations) {
    if (op.op === 'set') {
      patched[op.key] = op.value;
      applied.push(op);
    } else if (op.op === 'delete') {
      if (Object.prototype.hasOwnProperty.call(patched, op.key)) {
        delete patched[op.key];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    } else if (op.op === 'rename') {
      if (Object.prototype.hasOwnProperty.call(patched, op.from)) {
        patched[op.to] = patched[op.from];
        delete patched[op.from];
        applied.push(op);
      } else {
        skipped.push(op);
      }
    }
  }

  return { patched, applied, skipped };
}

export function parsePatchOperations(raw: string): PatchOperation[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      if (line.startsWith('- ')) {
        return { op: 'delete', key: line.slice(2).trim() } as PatchOperation;
      }
      if (line.includes(' -> ')) {
        const [from, to] = line.split(' -> ').map((s) => s.trim());
        return { op: 'rename', from, to } as PatchOperation;
      }
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(0, eqIdx).trim();
        const value = line.slice(eqIdx + 1).trim();
        return { op: 'set', key, value } as PatchOperation;
      }
      throw new Error(`Invalid patch operation: "${line}"`);
    });
}

export function formatPatchResult(result: PatchResult): string {
  const lines: string[] = [];
  lines.push(`Applied: ${result.applied.length} operation(s)`);
  lines.push(`Skipped: ${result.skipped.length} operation(s)`);
  if (result.skipped.length > 0) {
    lines.push('Skipped operations:');
    for (const op of result.skipped) {
      if (op.op === 'delete') lines.push(`  - delete ${op.key} (key not found)`);
      if (op.op === 'rename') lines.push(`  - rename ${op.from} -> ${op.to} (key not found)`);
    }
  }
  return lines.join('\n');
}
