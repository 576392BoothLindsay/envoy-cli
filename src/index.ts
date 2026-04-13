/**
 * envoy-cli — Main entry point
 *
 * Bootstraps the CLI application and delegates to the command registry.
 * This file is the executable entry point referenced in package.json "bin".
 */

import { run } from './cli/index';

// Kick off the CLI — process.argv is passed automatically by yargs via run()
run().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[envoy] Fatal error: ${message}\n`);
  process.exit(1);
});
