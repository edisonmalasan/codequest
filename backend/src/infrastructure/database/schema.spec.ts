import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DATABASE_TABLE_NAMES, FORBIDDEN_DERIVED_TABLE_NAMES } from './schema';

describe('database schema inventory', () => {
  it('contains only the approved durable relation inventory', () => {
    const forbiddenTables = new Set<string>(FORBIDDEN_DERIVED_TABLE_NAMES);
    expect(DATABASE_TABLE_NAMES).toHaveLength(17);
    expect(
      DATABASE_TABLE_NAMES.filter((tableName) =>
        forbiddenTables.has(tableName),
      ),
    ).toEqual([]);
  });

  it('commits a backend-only initial migration without browser grants', async () => {
    const migration = await readFile(
      resolve('drizzle/0000_wild_wild_child.sql'),
      'utf8',
    );

    expect(migration).toContain('CREATE SCHEMA "codequest"');
    expect(migration).toContain('CREATE TABLE "codequest"."users"');
    expect(migration).toContain('timestamp with time zone');
    expect(migration).not.toMatch(/\bGRANT\b/u);
    expect(migration).not.toContain('"courses"');
    expect(migration).not.toContain('"levels"');
    expect(migration).not.toContain('"unlocks"');
    expect(migration).not.toContain('"achievements"');
  });
});
