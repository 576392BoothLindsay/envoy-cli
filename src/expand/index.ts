/**
 * @module expand
 * @description Provides utilities for expanding environment variable references
 * within strings and objects. Supports common shell-style variable syntax
 * such as `$VAR`, `${VAR}`, and `${VAR:-default}`.
 */
export { expandValue, expandEnv, formatExpandResult } from './envExpander';
export type { ExpandResult } from './envExpander';
