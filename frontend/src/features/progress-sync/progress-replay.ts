import type {
  CreateAttemptRequest,
  ProtectedApiResult,
  AttemptResponse,
} from '@/lib/api-client';
import type { PendingOperationRecord } from '@/lib/db';
import {
  IndexedDbPendingOperationRepository,
  LocalPersistenceError,
} from '@/lib/local-persistence';

export type ReplayApi = {
  replayAttempt(
    questId: string,
    body: CreateAttemptRequest,
  ): Promise<ProtectedApiResult<AttemptResponse>>;
};
export interface ReplaySummary {
  confirmed: number;
  blocked: number;
  pending: boolean;
}

export function pendingSubmission(
  row: PendingOperationRecord,
): CreateAttemptRequest {
  let value: unknown;
  try {
    value = JSON.parse(row.payload) as unknown;
  } catch (cause) {
    throw new LocalPersistenceError('corrupt', cause);
  }
  if (
    typeof value !== 'object' ||
    value === null ||
    !('source' in value) ||
    typeof value.source !== 'string' ||
    !('report' in value) ||
    typeof value.report !== 'object' ||
    value.report === null ||
    Array.isArray(value.report)
  )
    throw new LocalPersistenceError('corrupt');
  return {
    clientEventId: row.eventId,
    contentVersion: row.contentVersion,
    assessmentVersion: row.assessmentVersion,
    source: value.source,
    report: { ...value.report },
  };
}

export class ProgressReplay {
  private running: Promise<ReplaySummary> | null = null;
  constructor(
    readonly repository = new IndexedDbPendingOperationRepository(),
    private readonly now: () => number = Date.now,
  ) {}

  async save(
    ownerId: string,
    questId: string,
    body: CreateAttemptRequest,
  ): Promise<void> {
    if (ownerId === 'guest') throw new LocalPersistenceError('invalid');
    const previous = (await this.repository.list(ownerId)).find(
      (row) => row.eventId === body.clientEventId,
    );
    await this.repository.enqueue({
      ownerId,
      questId,
      eventId: body.clientEventId,
      operationType: 'attempt-submit',
      contentVersion: body.contentVersion,
      assessmentVersion: body.assessmentVersion,
      payload: JSON.stringify({ source: body.source, report: body.report }),
      createdAt: previous?.createdAt ?? this.now(),
    });
  }

  replay(
    ownerId: string,
    api: ReplayApi,
    currentOwner: () => Promise<string | null>,
    retryBlocked = false,
  ): Promise<ReplaySummary> {
    // A second caller waits for the running pass, then checks for newly saved work.
    const previous =
      this.running ??
      Promise.resolve({ confirmed: 0, blocked: 0, pending: false });
    const pass = previous
      .catch(() => ({ confirmed: 0, blocked: 0, pending: true }))
      .then(() => this.deliver(ownerId, api, currentOwner, retryBlocked));
    this.running = pass;
    void pass
      .finally(() => {
        if (this.running === pass) this.running = null;
      })
      .catch(() => undefined);
    return pass;
  }

  private async deliver(
    ownerId: string,
    api: ReplayApi,
    currentOwner: () => Promise<string | null>,
    retryBlocked: boolean,
  ): Promise<ReplaySummary> {
    const summary: ReplaySummary = { confirmed: 0, blocked: 0, pending: false };
    if (ownerId === 'guest' || (await currentOwner()) !== ownerId)
      return summary;
    const rows = (await this.repository.list(ownerId)).filter(
      (row) =>
        row.delivery?.status !== 'confirmed' &&
        (retryBlocked || row.delivery?.status !== 'blocked'),
    );
    summary.pending = rows.length > 50;
    for (const row of rows.slice(0, 50)) {
      if ((await currentOwner()) !== ownerId) return summary;
      let body: CreateAttemptRequest;
      try {
        body = pendingSubmission(row);
      } catch {
        await this.repository.setDelivery(ownerId, row.eventId, {
          status: 'blocked',
          message:
            'Saved work is malformed. Copy its source before removing it.',
        });
        summary.blocked++;
        continue;
      }
      let result: ProtectedApiResult<AttemptResponse>;
      try {
        result = await api.replayAttempt(row.questId, body);
      } catch {
        summary.pending = true;
        break;
      }
      if ((await currentOwner()) !== ownerId) return summary;
      if (result.ok) {
        if (
          result.data.questId !== row.questId ||
          result.data.clientEventId !== row.eventId
        ) {
          summary.pending = true;
          break;
        }
        await this.repository.setDelivery(ownerId, row.eventId, {
          status: 'confirmed',
          message:
            'Delivery confirmed. Read current account progress for acceptance.',
        });
        summary.confirmed++;
      } else if (
        result.kind === 'http' &&
        [400, 403, 404, 409].includes(result.status)
      ) {
        const message =
          result.status === 409
            ? 'Version, prerequisite, or event conflict. Reopen the current quest and Check again if needed.'
            : result.status === 404
              ? 'Quest unavailable. Saved source is kept for recovery.'
              : 'Submission rejected. Saved source is kept for recovery.';
        await this.repository.setDelivery(ownerId, row.eventId, {
          status: 'blocked',
          message,
        });
        summary.blocked++;
      } else {
        summary.pending = true;
        break;
      }
    }
    return summary;
  }
}

export const progressReplay = new ProgressReplay();
