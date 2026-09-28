import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it } from 'vitest';
import { CodeQuestDatabase } from './db';

describe('local persistence skeleton', () => {
  const databases: CodeQuestDatabase[] = [];

  function createDatabase(): CodeQuestDatabase {
    const database = new CodeQuestDatabase(
      `test-${databases.length}-${Date.now()}`,
    );
    databases.push(database);
    return database;
  }

  afterEach(async () => {
    for (const database of databases.splice(0)) {
      database.close();
      await database.delete();
    }
  });

  it('isolates drafts per owner', async () => {
    const database = createDatabase();
    await database.drafts.bulkAdd([
      {
        id: 'draft-a',
        ownerId: 'owner-a',
        workspaceId: 'q01',
        fileId: 'main',
        source: 'const a = 1;',
        updatedAt: 1,
      },
      {
        id: 'draft-b',
        ownerId: 'owner-b',
        workspaceId: 'q01',
        fileId: 'main',
        source: 'const b = 2;',
        updatedAt: 2,
      },
    ]);

    const ownerDrafts = await database.drafts
      .where({ ownerId: 'owner-a', workspaceId: 'q01', fileId: 'main' })
      .toArray();
    expect(ownerDrafts.map((draft) => draft.id)).toEqual(['draft-a']);
  });

  it('migrates version-one quest drafts into a workspace main file', async () => {
    const name = `migration-${Date.now()}`;
    const legacy = new Dexie(name);
    legacy.version(1).stores({
      drafts: 'id, [ownerId+questId]',
      outbox: 'eventId, ownerId',
    });
    await legacy.table('drafts').add({
      id: 'legacy-draft',
      ownerId: 'owner-a',
      questId: 'q01',
      source: 'const legacy = true;',
      updatedAt: 3,
    });
    legacy.close();

    const database = new CodeQuestDatabase(name);
    databases.push(database);
    const migrated = await database.drafts.get('legacy-draft');

    expect(migrated).toMatchObject({
      ownerId: 'owner-a',
      workspaceId: 'q01',
      fileId: 'main',
      source: 'const legacy = true;',
    });
  });

  it('keeps outbox events unique and owner-scoped', async () => {
    const database = createDatabase();
    await database.outbox.add({
      eventId: 'event-1',
      ownerId: 'owner-a',
      questId: 'q01',
      contentVersion: 1,
      payload: '{}',
      createdAt: 1,
    });

    await expect(
      database.outbox.add({
        eventId: 'event-1',
        ownerId: 'owner-a',
        questId: 'q01',
        contentVersion: 1,
        payload: '{}',
        createdAt: 1,
      }),
    ).rejects.toThrow();

    const ownerEvents = await database.outbox
      .where('ownerId')
      .equals('owner-a')
      .toArray();
    const otherEvents = await database.outbox
      .where('ownerId')
      .equals('owner-b')
      .toArray();
    expect(ownerEvents).toHaveLength(1);
    expect(otherEvents).toHaveLength(0);
  });

  it('upgrades version-two drafts and legacy pending rows without replaying them', async () => {
    const name = `version-two-${Date.now()}`;
    const old = new Dexie(name);
    old.version(2).stores({
      drafts:
        'id, [ownerId+workspaceId+fileId], [ownerId+workspaceId], updatedAt',
      outbox: 'eventId, ownerId',
    });
    await old.table('drafts').add({
      id: 'old-draft',
      ownerId: 'owner-a',
      workspaceId: 'workspace-a',
      fileId: 'main',
      source: 'keep this source',
      updatedAt: 5,
    });
    await old.table('outbox').add({
      eventId: 'old-event',
      ownerId: 'owner-a',
      questId: 'Q01',
      contentVersion: 1,
      payload: '{}',
      createdAt: 6,
    });
    old.close();
    const database = new CodeQuestDatabase(name);
    databases.push(database);
    expect((await database.drafts.get('old-draft'))?.source).toBe(
      'keep this source',
    );
    expect((await database.outbox.get('old-event'))?.ownerId).toBe('owner-a');
    expect(await database.preferences.count()).toBe(0);
    expect(await database.lessonSnapshots.count()).toBe(0);
    expect(await database.guestState.count()).toBe(0);
  });
});
