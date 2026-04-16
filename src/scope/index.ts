/**
 * Scope utilities for parsing and manipulating environment variable scopes.
 * @module scope
 */
export {
  extractScope,
  splitByScopes,
  flattenScope,
  formatScopeResult,
} from "./envScope";
export type { ScopeRecord, ScopeResult, ExtractScopeResult } from "./envScope";
