/* global process, URL */

import { spawnSync } from 'node:child_process';

export function assertNoMigrationDrift(statusOutput) {
  const changedMigrationFiles = statusOutput
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  if (changedMigrationFiles.length > 0) {
    throw new Error(
      'Database schema and committed migrations differ; review and commit a new forward migration.',
    );
  }
}

if (process.argv.includes('--simulate-dirty')) {
  assertNoMigrationDrift('?? drizzle/0001_controlled_drift.sql');
} else {
  const executable =
    process.platform === 'win32' ? 'drizzle-kit.cmd' : 'drizzle-kit';
  const generate = spawnSync(
    executable,
    [
      'generate',
      '--config',
      'drizzle.config.ts',
      '--name',
      'migration-drift-check',
    ],
    { cwd: process.cwd(), encoding: 'utf8', shell: false, stdio: 'inherit' },
  );
  if (generate.status !== 0) process.exit(generate.status ?? 1);

  const status = spawnSync(
    'git',
    ['status', '--porcelain', '--untracked-files=all', '--', 'backend/drizzle'],
    {
      cwd: new URL('../..', import.meta.url),
      encoding: 'utf8',
      shell: false,
    },
  );
  if (status.status !== 0) process.exit(status.status ?? 1);
  assertNoMigrationDrift(status.stdout);
}
