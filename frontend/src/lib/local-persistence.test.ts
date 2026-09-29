import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { questFixtures } from '@/features/curriculum/journey-course-test-data';
import { CodeQuestDatabase } from './db';
import {
  IndexedDbGuestStateRepository,
  IndexedDbAcceptedProgressRepository,
  IndexedDbLessonSnapshotRepository,
  IndexedDbPendingOperationRepository,
  IndexedDbWorkspacePreferenceRepository,
  LocalPersistenceError,
  removeLocalOwnerData,
} from './local-persistence';

const databases: CodeQuestDatabase[] = [];
let sequence = 0;

function setup() {
  const name = `local-persistence-${++sequence}-${Date.now()}`;
  const database = new CodeQuestDatabase(name);
  databases.push(database);
  return { name, database };
}

afterEach(async () => {
  const all = databases.splice(0);
  const names = new Set(all.map((database) => database.name));
  all.forEach((database) => database.close());
  for (const name of names) await Dexie.delete(name);
});

describe('Phase 23 local repositories', () => {
  it('atomically stores downloaded versions and removes assets without deleting drafts', async () => {
    const { database } = setup();
    const lessons = new IndexedDbLessonSnapshotRepository(database);
    const quest = questFixtures.Q01;
    const assets = new Map([
      ['assets/example.png', new Blob(['image'], { type: 'image/png' })],
    ]);
    await lessons.saveDownloaded('owner-a', quest, assets);
    await lessons.saveDownloaded('owner-b', quest, new Map());
    const saved = await lessons.loadDownloaded(
      'owner-a',
      quest.id,
      quest.contentVersion,
      quest.assessmentVersion,
    );
    expect(saved?.assets.size).toBe(1);
    expect(
      (await lessons.listDownloaded('owner-a')).map((row) => row.ownerId),
    ).toEqual(['owner-a']);
    await expect(
      lessons.saveDownloaded(
        'owner-a',
        quest,
        new Map([
          ['assets/example.png', new Blob(['x'], { type: 'text/html' })],
        ]),
      ),
    ).rejects.toMatchObject({ kind: 'invalid' });
    expect(
      (
        await lessons.loadDownloaded(
          'owner-a',
          quest.id,
          quest.contentVersion,
          quest.assessmentVersion,
        )
      )?.assets.size,
    ).toBe(1);
    await database.drafts.put({
      id: 'draft',
      ownerId: 'owner-a',
      workspaceId: 'Q01',
      fileId: 'main',
      source: 'saved source',
      updatedAt: 1,
    });
    await lessons.remove(
      'owner-a',
      quest.id,
      quest.contentVersion,
      quest.assessmentVersion,
    );
    expect(await database.lessonAssets.count()).toBe(0);
    expect(await database.drafts.get('draft')).toMatchObject({
      source: 'saved source',
    });
    expect(await lessons.listDownloaded('owner-b')).toHaveLength(1);
  });

  it('rejects missing illustration records rather than claiming a complete download', async () => {
    const { database } = setup();
    const lessons = new IndexedDbLessonSnapshotRepository(database);
    const quest = questFixtures.Q01;
    await lessons.saveDownloaded(
      'guest',
      quest,
      new Map([
        ['assets/example.png', new Blob(['image'], { type: 'image/png' })],
      ]),
    );
    await database.lessonAssets.clear();
    await expect(
      lessons.loadDownloaded(
        'guest',
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      ),
    ).rejects.toMatchObject({ kind: 'corrupt' });
  });

  it('rolls back a quota-denied replacement and retains the previous package and pending source', async () => {
    const { database } = setup();
    const lessons = new IndexedDbLessonSnapshotRepository(database);
    const quest = questFixtures.Q01;
    const image = new Map([
      ['assets/example.png', new Blob(['original'], { type: 'image/png' })],
    ]);
    await lessons.saveDownloaded('owner-a', quest, image);
    await database.outbox.put({
      eventId: 'retain',
      ownerId: 'owner-a',
      questId: quest.id,
      contentVersion: 1,
      payload: 'recoverable source',
      createdAt: 1,
    });
    vi.spyOn(database.lessonSnapshots, 'put').mockRejectedValueOnce(
      new DOMException('quota', 'QuotaExceededError'),
    );
    await expect(
      lessons.saveDownloaded(
        'owner-a',
        { ...quest, title: 'replacement' },
        new Map(),
      ),
    ).rejects.toMatchObject({ kind: 'quota' });
    const previous = await lessons.loadDownloaded(
      'owner-a',
      quest.id,
      quest.contentVersion,
      quest.assessmentVersion,
    );
    expect(previous?.snapshot.title).toBe(quest.title);
    expect(previous?.assets.size).toBe(1);
    expect((await database.outbox.get('retain'))?.payload).toBe(
      'recoverable source',
    );
  });

  it('persists a minimal owner-bound accepted view without raw response or source fields', async () => {
    const { database } = setup();
    const cache = new IndexedDbAcceptedProgressRepository(database, () => 42);
    const fact = {
      questId: 'Q01',
      status: 'completed' as const,
      availability: 'available' as const,
      attemptCount: 2,
      hintCount: 1,
      startedAt: null,
      completedAt: null,
      lastActivityAt: null,
      unmetPrerequisites: [],
    };
    const progress = {
      journeyId: 'J01',
      status: 'completed' as const,
      completedQuests: 1,
      totalQuests: 1,
      percentage: 100,
      availability: 'available' as const,
      unmetPrerequisites: [],
      chapters: [
        {
          chapterId: 'CH01',
          status: 'completed' as const,
          completedQuests: 1,
          totalQuests: 1,
          percentage: 100,
          availability: 'available' as const,
          unmetPrerequisites: [],
          quests: [fact],
        },
      ],
    };
    await cache.save('owner-a', progress, [
      { questId: 'Q01', contentVersion: '1.0.0', assessmentVersion: '1.0.0' },
    ]);
    expect(await cache.load('owner-b', 'J01')).toBeNull();
    const saved = await cache.load('owner-a', 'J01');
    expect(saved).toMatchObject({
      capturedAt: 42,
      quests: [{ status: 'completed' }],
    });
    expect(JSON.stringify(saved)).not.toContain('attemptCount');
    await cache.clear('owner-a');
    expect(await cache.load('owner-a', 'J01')).toBeNull();
  });
  it('restores owner preferences across reopen, skips unchanged writes, and removes only one owner', async () => {
    const { name, database } = setup();
    const preferences = new IndexedDbWorkspacePreferenceRepository(
      database,
      () => 42,
    );
    await preferences.save('owner-a', 'Q01', 'main');
    const original = (await database.preferences.toArray())[0];
    await preferences.save('owner-a', 'Q01', 'main');
    expect(await database.preferences.toArray()).toEqual([original]);
    await preferences.save('owner-b', 'Q01', 'helper');
    database.close();
    const reopened = new CodeQuestDatabase(name);
    databases.push(reopened);
    const read = new IndexedDbWorkspacePreferenceRepository(reopened);
    expect(await read.load('owner-a', 'Q01')).toBe('main');
    expect(await read.load('owner-b', 'Q01')).toBe('helper');
    await removeLocalOwnerData('owner-a', reopened);
    expect(await read.load('owner-a', 'Q01')).toBeNull();
    expect(await read.load('owner-b', 'Q01')).toBe('helper');
  });

  it('stores only public exact-version lessons and preserves a good record on oversize rejection', async () => {
    const { database } = setup();
    const lessons = new IndexedDbLessonSnapshotRepository(database);
    const quest = questFixtures.Q01;
    const withExtra = Object.assign({}, quest, {
      accessToken: 'must-not-persist',
    });
    await lessons.save('owner-a', withExtra);
    expect(
      await lessons.load(
        'owner-a',
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      ),
    ).toEqual(quest);
    expect(
      JSON.stringify(await database.lessonSnapshots.toArray()),
    ).not.toContain('must-not-persist');
    expect(
      await lessons.load(
        'owner-b',
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      ),
    ).toBeNull();
    expect(
      await lessons.load('owner-a', quest.id, '2.0.0', quest.assessmentVersion),
    ).toBeNull();
    await expect(
      lessons.save('owner-a', { ...quest, lesson: 'x'.repeat(263_000) }),
    ).rejects.toMatchObject({ kind: 'too-large' });
    expect(
      await lessons.load(
        'owner-a',
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      ),
    ).toEqual(quest);
    await lessons.remove(
      'owner-a',
      quest.id,
      quest.contentVersion,
      quest.assessmentVersion,
    );
    expect(
      await lessons.load(
        'owner-a',
        quest.id,
        quest.contentVersion,
        quest.assessmentVersion,
      ),
    ).toBeNull();
  });

  it('keeps guest values versioned, bounded, and provisional', async () => {
    const { database } = setup();
    const guest = new IndexedDbGuestStateRepository(database, () => 42);
    await guest.save('practice', 1, { note: 'local only' });
    expect(await guest.load('practice', 1)).toEqual({ note: 'local only' });
    expect(await guest.load('practice', 2)).toBeNull();
    await expect(
      guest.save('practice', 1, 'x'.repeat(16_385)),
    ).rejects.toMatchObject({ kind: 'too-large' });
    expect(await guest.load('practice', 1)).toEqual({ note: 'local only' });
    await guest.remove('practice');
    expect(await guest.load('practice', 1)).toBeNull();
  });

  it('preserves legacy rows, deduplicates stable events, and rejects cross-owner removal', async () => {
    const { database } = setup();
    const pending = new IndexedDbPendingOperationRepository(database);
    await database.outbox.add({
      eventId: 'legacy',
      ownerId: 'owner-a',
      questId: 'Q01',
      contentVersion: 1,
      payload: '{}',
      createdAt: 1,
    });
    const envelope = {
      eventId: 'event-a',
      ownerId: 'owner-a',
      questId: 'Q01',
      operationType: 'attempt-submit' as const,
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
      payload: '{"source":"const x = 1"}',
      createdAt: 2,
    };
    await pending.enqueue(envelope);
    await pending.enqueue(envelope);
    await expect(
      pending.enqueue({
        ...envelope,
        eventId: 'oversize',
        payload: JSON.stringify({ source: 'x'.repeat(65_536) }),
      }),
    ).rejects.toMatchObject({ kind: 'too-large' });
    expect(await pending.list('owner-a')).toHaveLength(1);
    expect(await pending.listLegacy('owner-a')).toHaveLength(1);
    expect(await pending.list('owner-b')).toEqual([]);
    await expect(
      pending.enqueue({ ...envelope, payload: '{"source":"changed"}' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    await expect(
      pending.enqueue({ ...envelope, ownerId: 'owner-b' }),
    ).rejects.toMatchObject({ kind: 'conflict' });
    await expect(pending.remove('owner-b', 'event-a')).rejects.toMatchObject({
      kind: 'conflict',
    });
    await pending.remove('owner-a', 'event-a');
    expect(await pending.list('owner-a')).toEqual([]);
    expect(await pending.listLegacy('owner-a')).toHaveLength(1);
  });

  it('rejects malformed payloads before storage and reports unavailable IndexedDB', async () => {
    const { database } = setup();
    const pending = new IndexedDbPendingOperationRepository(database);
    await expect(
      pending.enqueue({
        eventId: 'bad',
        ownerId: 'owner-a',
        questId: 'Q01',
        operationType: 'attempt-submit',
        contentVersion: '1.0.0',
        assessmentVersion: '1.0.0',
        payload: '{',
        createdAt: 1,
      }),
    ).rejects.toBeInstanceOf(LocalPersistenceError);
    expect(await database.outbox.count()).toBe(0);
    vi.spyOn(database.preferences, 'get').mockRejectedValueOnce(
      new Error('storage denied'),
    );
    await expect(
      new IndexedDbWorkspacePreferenceRepository(database).load(
        'owner-a',
        'Q01',
      ),
    ).rejects.toMatchObject({ kind: 'unavailable' });
  });
});
