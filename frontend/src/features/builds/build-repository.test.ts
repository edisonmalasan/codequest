import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeQuestDatabase } from '@/lib/db';
import { createDraftId } from '@/features/editor/draft-repository';
import { IndexedDbBuildRepository } from './build-repository';

describe('device-local Build repository', () => {
  const databases: CodeQuestDatabase[] = [];
  let nextId = 0;
  function setup() {
    const database = new CodeQuestDatabase(
      `builds-${databases.length}-${Date.now()}`,
    );
    databases.push(database);
    const repository = new IndexedDbBuildRepository(
      database,
      () => 100,
      () => `00000000-0000-4000-8000-${String(++nextId).padStart(12, '0')}`,
    );
    return { database, repository };
  }

  afterEach(async () => {
    for (const database of databases.splice(0)) {
      database.close();
      await database.delete();
    }
  });

  it('creates, lists and reopens Builds only for their originating owner', async () => {
    const { repository } = setup();
    const first = await repository.create('guest');
    const second = await repository.create('account-a');
    expect(first.workspaceId).toBe(`build:${first.id}`);
    expect(first.fileIds).toEqual(['index.html', 'style.css', 'main.js']);
    expect((await repository.list('guest')).map((build) => build.id)).toEqual([
      first.id,
    ]);
    expect(
      (await repository.list('account-a')).map((build) => build.id),
    ).toEqual([second.id]);
    await expect(repository.load('account-a', first.id)).resolves.toBeNull();
    await expect(repository.load('guest', first.id)).resolves.toEqual(first);
  });

  it('does not execute or silently convert incompatible stored metadata', async () => {
    const { database, repository } = setup();
    const created = await repository.create('guest');
    const malformed = { ...created };
    Reflect.set(malformed, 'manifestVersion', 2);
    await database.builds.put(malformed);
    await expect(repository.load('guest', created.id)).rejects.toMatchObject({
      kind: 'corrupt',
    });
    await expect(repository.list('guest')).rejects.toMatchObject({
      kind: 'corrupt',
    });
    expect((await database.builds.get(created.id))?.manifestVersion).toBe(2);
  });

  it('requires a scoped confirmed removal and leaves other work intact', async () => {
    const { database, repository } = setup();
    const own = await repository.create('guest');
    const other = await repository.create('account-a');
    const ownDraftId = createDraftId(
      { ownerId: 'guest', workspaceId: own.workspaceId },
      'main.js',
    );
    const otherDraftId = createDraftId(
      { ownerId: 'account-a', workspaceId: other.workspaceId },
      'main.js',
    );
    await database.drafts.bulkAdd([
      {
        id: ownDraftId,
        ownerId: 'guest',
        workspaceId: own.workspaceId,
        fileId: 'main.js',
        source: 'edit',
        updatedAt: 1,
      },
      {
        id: otherDraftId,
        ownerId: 'account-a',
        workspaceId: other.workspaceId,
        fileId: 'main.js',
        source: 'private',
        updatedAt: 1,
      },
      {
        id: 'lesson',
        ownerId: 'guest',
        workspaceId: 'Q01',
        fileId: 'main',
        source: 'lesson',
        updatedAt: 1,
      },
    ]);
    await database.preferences.bulkAdd([
      {
        id: 'own-preference',
        ownerId: 'guest',
        workspaceId: own.workspaceId,
        activeFileId: 'main.js',
        updatedAt: 1,
      },
      {
        id: 'other-preference',
        ownerId: 'account-a',
        workspaceId: other.workspaceId,
        activeFileId: 'main.js',
        updatedAt: 1,
      },
    ]);
    await expect(repository.remove('account-a', own.id)).resolves.toBe(false);
    expect(await database.builds.get(own.id)).toBeDefined();
    await expect(repository.remove('guest', own.id)).resolves.toBe(true);
    expect(await database.builds.get(own.id)).toBeUndefined();
    expect(await database.drafts.get(ownDraftId)).toBeUndefined();
    expect(await database.preferences.get('own-preference')).toBeUndefined();
    expect(await database.builds.get(other.id)).toEqual(other);
    expect((await database.drafts.get(otherDraftId))?.source).toBe('private');
    expect((await database.drafts.get('lesson'))?.source).toBe('lesson');
    expect(await database.preferences.get('other-preference')).toBeDefined();
  });

  it('rolls back removal on storage failure and does not alter in-memory source', async () => {
    const { database, repository } = setup();
    const own = await repository.create('guest');
    const editableSource = { current: 'unsaved edit stays in memory' };
    await database.drafts.add({
      id: 'draft',
      ownerId: 'guest',
      workspaceId: own.workspaceId,
      fileId: 'main.js',
      source: 'durable edit',
      updatedAt: 1,
    });
    const failure = vi
      .spyOn(database.builds, 'delete')
      .mockRejectedValueOnce(new Error('disk unavailable'));
    await expect(repository.remove('guest', own.id)).rejects.toMatchObject({
      kind: 'unavailable',
    });
    failure.mockRestore();
    expect(await database.builds.get(own.id)).toEqual(own);
    expect((await database.drafts.get('draft'))?.source).toBe('durable edit');
    expect(editableSource.current).toBe('unsaved edit stays in memory');
  });
});
