import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeQuestDatabase } from '@/lib/db';
import { IndexedDbPendingOperationRepository } from '@/lib/local-persistence';
import type {
  AttemptResponse,
  CreateAttemptRequest,
  ProtectedApiResult,
} from '@/lib/api-client';
import { ProgressReplay } from './progress-replay';

const databases: CodeQuestDatabase[] = [];
function setup() {
  const database = new CodeQuestDatabase(`replay-${crypto.randomUUID()}`);
  databases.push(database);
  const repository = new IndexedDbPendingOperationRepository(database);
  return {
    database,
    repository,
    replay: new ProgressReplay(repository, () => 10),
  };
}
function body(id = crypto.randomUUID()): CreateAttemptRequest {
  return {
    clientEventId: id,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    source: 'saved source',
    report: { status: 'completed', passed: true },
  };
}
function confirmed(
  submission: CreateAttemptRequest,
): ProtectedApiResult<AttemptResponse> {
  return {
    ok: true,
    requestId: null,
    data: {
      ...submission,
      id: 'attempt',
      questId: 'Q01',
      submittedAt: '2026-09-29T00:00:00Z',
      attemptCount: 1,
      reportedPassed: true,
      accepted: true,
      clientReported: true,
    },
  };
}
afterEach(async () => {
  for (const database of databases) database.close();
  for (const database of databases.splice(0)) await database.delete();
});

describe('durable authenticated replay', () => {
  it('reopens and retries the identical event after an uncertain response without persisting protected data', async () => {
    const { database, replay } = setup();
    const submission = body();
    await replay.save('A', 'Q01', submission);
    const api = {
      replayAttempt: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, kind: 'network' })
        .mockResolvedValue(confirmed(submission)),
    };
    expect(await replay.replay('A', api, async () => 'A')).toMatchObject({
      pending: true,
      confirmed: 0,
    });
    const reopened = new CodeQuestDatabase(database.name);
    databases.push(reopened);
    const next = new ProgressReplay(
      new IndexedDbPendingOperationRepository(reopened),
    );
    expect(await next.replay('A', api, async () => 'A')).toMatchObject({
      confirmed: 1,
    });
    expect(api.replayAttempt.mock.calls).toEqual([
      ['Q01', submission],
      ['Q01', submission],
    ]);
    const rows = await next.repository.list('A');
    expect(rows[0].delivery?.status).toBe('confirmed');
    expect(rows[0].payload).not.toContain('submittedAt');
    expect(rows[0].payload).toBe(
      JSON.stringify({ source: submission.source, report: submission.report }),
    );
    await next.replay('A', api, async () => 'A');
    expect(api.replayAttempt).toHaveBeenCalledTimes(2);
  });

  it('keeps blocked source and original versions for explicit retry', async () => {
    const { replay } = setup();
    const submission = body();
    await replay.save('A', 'Q01', submission);
    const api = {
      replayAttempt: vi
        .fn()
        .mockResolvedValue({ ok: false, kind: 'http', status: 409 }),
    };
    expect(await replay.replay('A', api, async () => 'A')).toMatchObject({
      blocked: 1,
    });
    await replay.replay('A', api, async () => 'A');
    expect(api.replayAttempt).toHaveBeenCalledTimes(1);
    await replay.replay('A', api, async () => 'A', true);
    expect(api.replayAttempt).toHaveBeenCalledTimes(2);
    expect((await replay.repository.list('A'))[0].payload).toContain(
      'saved source',
    );
    expect(api.replayAttempt).toHaveBeenLastCalledWith('Q01', submission);
  });

  it('excludes guest and legacy work and refuses another owner before transport', async () => {
    const { database, replay } = setup();
    await replay.save('A', 'Q01', body());
    await database.outbox.add({
      eventId: 'legacy',
      ownerId: 'A',
      questId: 'Q01',
      contentVersion: 1,
      createdAt: 1,
      payload: 'old source',
    });
    const api = { replayAttempt: vi.fn() };
    await replay.replay('A', api, async () => 'B');
    await replay.replay('guest', api, async () => 'guest');
    expect(api.replayAttempt).not.toHaveBeenCalled();
    await expect(replay.save('guest', 'Q01', body())).rejects.toThrow();
    expect(await replay.repository.listLegacy('A')).toHaveLength(1);
    await expect(
      replay.repository.remove(
        'B',
        (await replay.repository.list('A'))[0].eventId,
      ),
    ).rejects.toThrow();
  });

  it('suppresses an in-flight old-owner response and stops further sends', async () => {
    const { replay } = setup();
    const submission = body();
    let owner = 'A';
    await replay.save('A', 'Q01', submission);
    await replay.save('A', 'Q01', body());
    const api = {
      replayAttempt: vi.fn().mockImplementation(async () => {
        owner = 'B';
        return confirmed(submission);
      }),
    };
    expect(await replay.replay('A', api, async () => owner)).toMatchObject({
      confirmed: 0,
    });
    expect(api.replayAttempt).toHaveBeenCalledTimes(1);
    expect(
      (await replay.repository.list('A')).every((row) => !row.delivery),
    ).toBe(true);
    expect(await replay.repository.list('B')).toEqual([]);
  });

  it('serializes overlapping passes and bounds each pass to 50 requests', async () => {
    const { replay } = setup();
    for (let index = 0; index < 51; index++)
      await replay.save('A', 'Q01', body());
    let concurrent = 0;
    let maximum = 0;
    const api = {
      replayAttempt: vi
        .fn()
        .mockImplementation(
          async (_quest: string, submission: CreateAttemptRequest) => {
            concurrent++;
            maximum = Math.max(maximum, concurrent);
            await Promise.resolve();
            concurrent--;
            return confirmed(submission);
          },
        ),
    };
    expect(await replay.replay('A', api, async () => 'A')).toMatchObject({
      confirmed: 50,
      pending: true,
    });
    await Promise.all([
      replay.replay('A', api, async () => 'A'),
      replay.replay('A', api, async () => 'A'),
    ]);
    expect(maximum).toBe(1);
    expect(api.replayAttempt).toHaveBeenCalledTimes(51);
  });

  it('preserves immutable payload on conflict and after metadata storage failure', async () => {
    const { replay, repository } = setup();
    const submission = body();
    await replay.save('A', 'Q01', submission);
    await replay.save('A', 'Q01', submission);
    await expect(
      replay.save('A', 'Q01', { ...submission, source: 'other' }),
    ).rejects.toThrow();
    vi.spyOn(repository, 'setDelivery').mockRejectedValueOnce(
      new Error('quota'),
    );
    await expect(
      replay.replay(
        'A',
        { replayAttempt: async () => confirmed(submission) },
        async () => 'A',
      ),
    ).rejects.toThrow('quota');
    expect((await repository.list('A'))[0].delivery).toBeUndefined();
    expect((await repository.list('A'))[0].payload).toContain('saved source');
  });
});
