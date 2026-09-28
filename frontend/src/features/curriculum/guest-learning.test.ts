import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeQuestDatabase } from '@/lib/db';
import {
  IndexedDbGuestStateRepository,
  IndexedDbPendingOperationRepository,
} from '@/lib/local-persistence';
import type { ValidationResult } from '@/features/validation';
import { GuestLearningRepository } from './guest-learning';

let sequence = 0;
const databases: CodeQuestDatabase[] = [];

function setup(name = `guest-learning-${++sequence}-${Date.now()}`) {
  const database = new CodeQuestDatabase(name);
  databases.push(database);
  let index = 0;
  const guest = new GuestLearningRepository(
    new IndexedDbGuestStateRepository(database, () => 10),
    new IndexedDbPendingOperationRepository(database),
    () => 10,
    () => `00000000-0000-4000-8000-${String(++index).padStart(12, '0')}`,
  );
  return { name, database, guest };
}

afterEach(async () => {
  const all = databases.splice(0);
  const names = new Set(all.map((database) => database.name));
  all.forEach((database) => database.close());
  for (const name of names) await Dexie.delete(name);
});

const pass: ValidationResult = {
  checkId: 'check',
  status: 'completed',
  passed: true,
  cases: [{ id: 'case', label: 'Case', status: 'passed', message: 'Passed' }],
  failedCaseIds: [],
  feedback: 'Passed',
  durationMs: 2,
};

describe('guest provisional progress', () => {
  it('stores one owner-isolated versioned snapshot across reopen', async () => {
    const { name, database, guest } = setup();
    await guest.start('Q01');
    const saved = await guest.pass(
      'Q01',
      '1.0.0',
      '1.0.0',
      'const x = 1',
      pass,
    );
    expect(saved.submission).toMatchObject({ source: 'const x = 1' });
    expect(await database.outbox.where('ownerId').equals('guest').count()).toBe(
      1,
    );
    expect(
      await database.outbox.where('ownerId').equals('account-a').count(),
    ).toBe(0);
    database.close();
    const reopened = setup(name).guest;
    expect(await reopened.load('Q01')).toMatchObject({
      questId: 'Q01',
      contentVersion: '1.0.0',
      submission: { source: 'const x = 1', assessmentVersion: '1.0.0' },
    });
  });

  it('rejects non-guest IDs and retains old source after oversize or invalid pass', async () => {
    const { guest } = setup();
    await expect(guest.start('Q05')).rejects.toMatchObject({ kind: 'invalid' });
    await guest.pass('Q01', '1.0.0', '1.0.0', 'good source', pass);
    await expect(
      guest.pass('Q01', '1.0.0', '1.0.0', 'x'.repeat(65_536), pass),
    ).rejects.toMatchObject({ kind: 'too-large' });
    await expect(
      guest.pass('Q01', '1.0.0', '1.0.0', 'bad', { ...pass, passed: false }),
    ).rejects.toMatchObject({ kind: 'invalid' });
    expect((await guest.load('Q01'))?.submission?.source).toBe('good source');
  });

  it('keeps the selected event stable on read and detects missing envelope', async () => {
    const { database, guest } = setup();
    const saved = await guest.pass('Q02', '1.0.0', '1.0.0', 'source', pass);
    expect((await guest.load('Q02'))?.submission?.clientEventId).toBe(
      saved.eventId,
    );
    expect(await guest.list()).toHaveLength(1);
    if (!saved.eventId) throw new Error('Expected a durable event ID');
    await database.outbox.delete(saved.eventId);
    await expect(guest.load('Q02')).rejects.toMatchObject({ kind: 'corrupt' });
  });

  it('selects the newest durable Check without overwriting earlier recovery source', async () => {
    const { database, guest } = setup();
    const prior = await guest.pass('Q03', '1.0.0', '1.0.0', 'old source', pass);
    const latest = await guest.pass(
      'Q03',
      '1.0.0',
      '1.0.0',
      'new source',
      pass,
    );
    expect(latest.eventId).not.toBe(prior.eventId);
    expect((await guest.load('Q03'))?.submission?.source).toBe('new source');
    expect(await database.outbox.where('ownerId').equals('guest').count()).toBe(
      2,
    );
  });

  it('rejects malformed guest metadata without returning false progress', async () => {
    const { database, guest } = setup();
    await new IndexedDbGuestStateRepository(database).save(
      'quest-progress:Q01',
      1,
      { questId: 'Q01', startedAt: 'forged' },
    );
    await expect(guest.load('Q01')).rejects.toMatchObject({ kind: 'corrupt' });
  });

  it('serializes a slow start before a passing Check for the same quest', async () => {
    const { database } = setup();
    const state = new IndexedDbGuestStateRepository(database);
    const originalSave = state.save.bind(state);
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.spyOn(state, 'save').mockImplementationOnce(
      async (key, version, value) => {
        await gate;
        await originalSave(key, version, value);
      },
    );
    const guest = new GuestLearningRepository(
      state,
      new IndexedDbPendingOperationRepository(database),
      () => 10,
      () => '00000000-0000-4000-8000-000000000090',
    );
    const started = guest.start('Q01');
    const completed = guest.pass('Q01', '1.0.0', '1.0.0', 'saved source', pass);
    release?.();
    await Promise.all([started, completed]);
    expect((await guest.load('Q01'))?.submission?.source).toBe('saved source');
  });
});
