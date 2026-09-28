import type { CreateAttemptRequest } from '@/lib/api-client';
import {
  IndexedDbGuestStateRepository,
  IndexedDbPendingOperationRepository,
  LocalPersistenceError,
} from '@/lib/local-persistence';
import type { ValidationResult } from '@/features/validation';

const GUEST_QUEST_IDS = ['Q01', 'Q02', 'Q03', 'Q04'] as const;
const GUEST_PROGRESS_VERSION = 1;

export function isGuestQuestId(value: string): boolean {
  return GUEST_QUEST_IDS.some((id) => id === value);
}

interface GuestProgressRecord {
  questId: string;
  startedAt: number;
  eventId?: string;
  contentVersion?: string;
  assessmentVersion?: string;
}

export interface GuestProgress extends GuestProgressRecord {
  submission?: CreateAttemptRequest;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isProgress(
  value: unknown,
  questId: string,
): value is GuestProgressRecord {
  return (
    isRecord(value) &&
    value.questId === questId &&
    Number.isSafeInteger(value.startedAt) &&
    Number(value.startedAt) >= 0 &&
    (value.eventId === undefined || typeof value.eventId === 'string') &&
    (value.contentVersion === undefined ||
      typeof value.contentVersion === 'string') &&
    (value.assessmentVersion === undefined ||
      typeof value.assessmentVersion === 'string')
  );
}

function isSubmission(value: unknown): value is {
  source: string;
  report: Record<string, unknown>;
} {
  return (
    isRecord(value) &&
    typeof value.source === 'string' &&
    isRecord(value.report)
  );
}

export class GuestLearningRepository {
  private readonly writes = new Map<string, Promise<void>>();

  constructor(
    private readonly state = new IndexedDbGuestStateRepository(),
    private readonly pending = new IndexedDbPendingOperationRepository(),
    private readonly now: () => number = Date.now,
    private readonly eventId: () => string = () => crypto.randomUUID(),
  ) {}

  private key(questId: string): string {
    if (!isGuestQuestId(questId)) throw new LocalPersistenceError('invalid');
    return `quest-progress:${questId}`;
  }

  private serialize<T>(questId: string, action: () => Promise<T>): Promise<T> {
    const previous = this.writes.get(questId) ?? Promise.resolve();
    const operation = previous.then(action);
    this.writes.set(
      questId,
      operation.then(
        () => undefined,
        () => undefined,
      ),
    );
    return operation;
  }

  async start(questId: string): Promise<GuestProgress> {
    const key = this.key(questId);
    return this.serialize(questId, async () => {
      const current = await this.state.load(key, GUEST_PROGRESS_VERSION);
      if (current !== null) {
        if (!isProgress(current, questId))
          throw new LocalPersistenceError('corrupt');
        const loaded = await this.load(questId);
        if (loaded === null) throw new LocalPersistenceError('corrupt');
        return loaded;
      }
      const row: GuestProgressRecord = { questId, startedAt: this.now() };
      await this.state.save(key, GUEST_PROGRESS_VERSION, row);
      return row;
    });
  }

  async pass(
    questId: string,
    contentVersion: string,
    assessmentVersion: string,
    source: string,
    report: ValidationResult,
  ): Promise<GuestProgress> {
    const key = this.key(questId);
    if (
      report.status !== 'completed' ||
      !report.passed ||
      !contentVersion ||
      !assessmentVersion ||
      typeof source !== 'string'
    )
      throw new LocalPersistenceError('invalid');
    return this.serialize(questId, async () => {
      const existing = await this.state.load(key, GUEST_PROGRESS_VERSION);
      if (existing !== null && !isProgress(existing, questId))
        throw new LocalPersistenceError('corrupt');
      const eventId = this.eventId();
      const payload = JSON.stringify({ source, report });
      await this.pending.enqueue({
        eventId,
        ownerId: 'guest',
        questId,
        operationType: 'attempt-submit',
        contentVersion,
        assessmentVersion,
        payload,
        createdAt: this.now(),
      });
      const row: GuestProgressRecord = {
        questId,
        startedAt: existing?.startedAt ?? this.now(),
        eventId,
        contentVersion,
        assessmentVersion,
      };
      await this.state.save(key, GUEST_PROGRESS_VERSION, row);
      return {
        ...row,
        submission: {
          clientEventId: eventId,
          contentVersion,
          assessmentVersion,
          source,
          report: { ...report },
        },
      };
    });
  }

  async load(questId: string): Promise<GuestProgress | null> {
    const current = await this.state.load(
      this.key(questId),
      GUEST_PROGRESS_VERSION,
    );
    if (current === null) return null;
    if (!isProgress(current, questId))
      throw new LocalPersistenceError('corrupt');
    if (!current.eventId) return current;
    const event = (await this.pending.list('guest')).find(
      (row) => row.eventId === current.eventId && row.questId === questId,
    );
    if (
      !event ||
      event.contentVersion !== current.contentVersion ||
      event.assessmentVersion !== current.assessmentVersion
    )
      throw new LocalPersistenceError('corrupt');
    let parsed: unknown;
    try {
      parsed = JSON.parse(event.payload) as unknown;
    } catch (cause) {
      throw new LocalPersistenceError('corrupt', cause);
    }
    if (!isSubmission(parsed)) throw new LocalPersistenceError('corrupt');
    return {
      ...current,
      submission: {
        clientEventId: event.eventId,
        contentVersion: event.contentVersion,
        assessmentVersion: event.assessmentVersion,
        source: parsed.source,
        report: parsed.report,
      },
    };
  }

  async list(): Promise<GuestProgress[]> {
    const records = await Promise.all(
      GUEST_QUEST_IDS.map((id) => this.load(id)),
    );
    return records.filter((row): row is GuestProgress => row !== null);
  }
}

export const guestLearningRepository = new GuestLearningRepository();
