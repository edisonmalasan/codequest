import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { CodeQuestDatabase } from '@/lib/db';
import { createDraftId, IndexedDbDraftRepository } from './draft-repository';

describe('IndexedDbDraftRepository', () => {
  const databases: CodeQuestDatabase[] = [];

  function setup(): {
    database: CodeQuestDatabase;
    repository: IndexedDbDraftRepository;
  } {
    const database = new CodeQuestDatabase(
      `editor-drafts-${databases.length}-${Date.now()}`,
    );
    databases.push(database);
    return {
      database,
      repository: new IndexedDbDraftRepository(database, () => 42),
    };
  }

  afterEach(async () => {
    for (const database of databases.splice(0)) {
      database.close();
      await database.delete();
    }
  });

  it('saves and loads only requested files for one owner and workspace', async () => {
    const { repository } = setup();
    await repository.save({ ownerId: 'owner-a', workspaceId: 'workspace-a' }, [
      { fileId: 'main', source: 'const a = 1;' },
      { fileId: 'helper', source: 'export const helper = true;' },
    ]);
    await repository.save({ ownerId: 'owner-b', workspaceId: 'workspace-a' }, [
      { fileId: 'main', source: 'private owner source' },
    ]);

    await expect(
      repository.load({ ownerId: 'owner-a', workspaceId: 'workspace-a' }, [
        'helper',
      ]),
    ).resolves.toEqual([
      { fileId: 'helper', source: 'export const helper = true;' },
    ]);
  });

  it('returns no draft when the identity has no matching record', async () => {
    const { repository } = setup();
    await expect(
      repository.load({ ownerId: 'missing', workspaceId: 'workspace-a' }, [
        'main',
      ]),
    ).resolves.toEqual([]);
  });

  it('uses a deterministic encoded identity without exposing another key', () => {
    expect(
      createDraftId(
        { ownerId: 'owner:one', workspaceId: 'workspace/one' },
        'main file',
      ),
    ).toBe('owner%3Aone:workspace%2Fone:main%20file');
  });
});
