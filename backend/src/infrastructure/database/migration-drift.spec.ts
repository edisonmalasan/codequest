import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('migration drift command', () => {
  it('fails for a controlled uncommitted migration', () => {
    const scriptPath = resolve('scripts/check-migration-drift.mjs');
    const result = spawnSync(
      process.execPath,
      [scriptPath, '--simulate-dirty'],
      {
        encoding: 'utf8',
      },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      'Database schema and committed migrations differ',
    );
  });
});
