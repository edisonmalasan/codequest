import { isQuestDetail, type QuestDetail } from './api-client';
import {
  db,
  type CodeQuestDatabase,
  type GuestStateRecord,
  type LessonSnapshotRecord,
  type OutboxRecord,
  type PendingOperationRecord,
  type WorkspacePreferenceRecord,
} from './db';

export const LOCAL_LIMITS = {
  preferenceBytes: 4_096,
  lessonBytes: 262_144,
  guestValueBytes: 16_384,
  pendingPayloadBytes: 65_536,
} as const;

export type LocalPersistenceErrorKind =
  'invalid' | 'too-large' | 'unavailable' | 'conflict' | 'corrupt';

export class LocalPersistenceError extends Error {
  constructor(
    readonly kind: LocalPersistenceErrorKind,
    cause?: unknown,
  ) {
    super(`Local persistence ${kind}`, { cause });
    this.name = 'LocalPersistenceError';
  }
}

function boundedText(value: string, limit: number): void {
  if (typeof value !== 'string' || !value)
    throw new LocalPersistenceError('invalid');
  if (value.length > limit || new TextEncoder().encode(value).length > limit)
    throw new LocalPersistenceError('too-large');
}

function identityPart(value: string): void {
  boundedText(value, 128);
}

function recordId(...parts: readonly string[]): string {
  parts.forEach(identityPart);
  return parts.map(encodeURIComponent).join(':');
}

function jsonText(value: unknown, limit: number): string {
  let serialized: string | undefined;
  try {
    serialized = JSON.stringify(value);
  } catch (cause) {
    throw new LocalPersistenceError('invalid', cause);
  }
  if (serialized === undefined) throw new LocalPersistenceError('invalid');
  boundedText(serialized, limit);
  return serialized;
}

async function stored<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (cause) {
    if (cause instanceof LocalPersistenceError) throw cause;
    throw new LocalPersistenceError('unavailable', cause);
  }
}

export interface WorkspacePreferenceRepository {
  load(ownerId: string, workspaceId: string): Promise<string | null>;
  save(
    ownerId: string,
    workspaceId: string,
    activeFileId: string,
  ): Promise<void>;
}

function publicLessonSnapshot(quest: QuestDetail): QuestDetail {
  const { journey, chapter } = quest.hierarchy;
  return {
    id: quest.id,
    slug: quest.slug,
    title: quest.title,
    position: quest.position,
    kind: quest.kind,
    guestEligible: quest.guestEligible,
    contentVersion: quest.contentVersion,
    assessmentVersion: quest.assessmentVersion,
    difficulty: quest.difficulty,
    xpAward: quest.xpAward,
    hierarchy: {
      journey: {
        id: journey.id,
        slug: journey.slug,
        title: journey.title,
        position: journey.position,
        chapterCount: journey.chapterCount,
        questCount: journey.questCount,
      },
      chapter: {
        id: chapter.id,
        slug: chapter.slug,
        title: chapter.title,
        position: chapter.position,
        objectiveSummary: chapter.objectiveSummary,
        questCount: chapter.questCount,
      },
    },
    objective: quest.objective,
    outcomeId: quest.outcomeId,
    concepts: quest.concepts.map(({ id, title }) => ({ id, title })),
    prerequisites: quest.prerequisites.map(({ id, slug, title }) => ({
      id,
      slug,
      title,
    })),
    hints: {
      question: quest.hints.question,
      concept: quest.hints.concept,
      nextStep: quest.hints.nextStep,
    },
    lesson: quest.lesson,
    starterCode: quest.starterCode,
    cases: quest.cases.map((item) => ({
      id: item.id,
      category: item.category,
      kind: item.kind,
      feedback: item.feedback,
      ...(item.expectedOutput === undefined
        ? {}
        : { expectedOutput: item.expectedOutput }),
      ...(item.functionName === undefined
        ? {}
        : { functionName: item.functionName }),
      ...(item.args === undefined ? {} : { args: item.args }),
      ...(item.expected === undefined ? {} : { expected: item.expected }),
    })),
    ...(quest.explanationPrompt === undefined
      ? {}
      : { explanationPrompt: quest.explanationPrompt }),
    ...(quest.transferPrompt === undefined
      ? {}
      : { transferPrompt: quest.transferPrompt }),
  };
}

export class IndexedDbWorkspacePreferenceRepository implements WorkspacePreferenceRepository {
  constructor(
    private readonly database: CodeQuestDatabase = db,
    private readonly now: () => number = Date.now,
  ) {}

  async load(ownerId: string, workspaceId: string): Promise<string | null> {
    const id = recordId(ownerId, workspaceId);
    const row = await stored(() => this.database.preferences.get(id));
    if (!row) return null;
    if (
      row.ownerId !== ownerId ||
      row.workspaceId !== workspaceId ||
      typeof row.activeFileId !== 'string' ||
      !row.activeFileId
    )
      throw new LocalPersistenceError('corrupt');
    return row.activeFileId;
  }

  async save(
    ownerId: string,
    workspaceId: string,
    activeFileId: string,
  ): Promise<void> {
    const id = recordId(ownerId, workspaceId);
    identityPart(activeFileId);
    const row: WorkspacePreferenceRecord = {
      id,
      ownerId,
      workspaceId,
      activeFileId,
      updatedAt: this.now(),
    };
    jsonText(row, LOCAL_LIMITS.preferenceBytes);
    await stored(() =>
      this.database.transaction('rw', this.database.preferences, async () => {
        const previous = await this.database.preferences.get(id);
        if (previous?.activeFileId !== activeFileId)
          await this.database.preferences.put(row);
      }),
    );
  }
}

export class IndexedDbLessonSnapshotRepository {
  constructor(
    private readonly database: CodeQuestDatabase = db,
    private readonly now: () => number = Date.now,
  ) {}

  async save(ownerId: string, snapshot: QuestDetail): Promise<void> {
    identityPart(ownerId);
    if (!isQuestDetail(snapshot)) throw new LocalPersistenceError('invalid');
    const id = recordId(
      ownerId,
      snapshot.id,
      snapshot.contentVersion,
      snapshot.assessmentVersion,
    );
    const serialized = jsonText(
      publicLessonSnapshot(snapshot),
      LOCAL_LIMITS.lessonBytes,
    );
    const parsed: unknown = JSON.parse(serialized);
    if (!isQuestDetail(parsed)) throw new LocalPersistenceError('invalid');
    const row: LessonSnapshotRecord = {
      id,
      ownerId,
      questId: snapshot.id,
      contentVersion: snapshot.contentVersion,
      assessmentVersion: snapshot.assessmentVersion,
      snapshot: parsed,
      savedAt: this.now(),
    };
    await stored(() => this.database.lessonSnapshots.put(row));
  }

  async load(
    ownerId: string,
    questId: string,
    contentVersion: string,
    assessmentVersion: string,
  ): Promise<QuestDetail | null> {
    const id = recordId(ownerId, questId, contentVersion, assessmentVersion);
    const row = await stored(() => this.database.lessonSnapshots.get(id));
    if (!row) return null;
    if (
      row.ownerId !== ownerId ||
      row.questId !== questId ||
      row.contentVersion !== contentVersion ||
      row.assessmentVersion !== assessmentVersion ||
      !isQuestDetail(row.snapshot) ||
      row.snapshot.id !== questId ||
      row.snapshot.contentVersion !== contentVersion ||
      row.snapshot.assessmentVersion !== assessmentVersion
    )
      throw new LocalPersistenceError('corrupt');
    return row.snapshot;
  }

  async remove(
    ownerId: string,
    questId: string,
    contentVersion: string,
    assessmentVersion: string,
  ): Promise<void> {
    const id = recordId(ownerId, questId, contentVersion, assessmentVersion);
    await stored(() => this.database.lessonSnapshots.delete(id));
  }
}

export class IndexedDbGuestStateRepository {
  constructor(
    private readonly database: CodeQuestDatabase = db,
    private readonly now: () => number = Date.now,
  ) {}

  async save(key: string, version: number, value: unknown): Promise<void> {
    const id = recordId('guest', key);
    if (!Number.isSafeInteger(version) || version < 1)
      throw new LocalPersistenceError('invalid');
    const payload = jsonText(value, LOCAL_LIMITS.guestValueBytes);
    const row: GuestStateRecord = {
      id,
      ownerId: 'guest',
      key,
      version,
      payload,
      updatedAt: this.now(),
    };
    await stored(() => this.database.guestState.put(row));
  }

  async load(key: string, version: number): Promise<unknown | null> {
    if (!Number.isSafeInteger(version) || version < 1)
      throw new LocalPersistenceError('invalid');
    const id = recordId('guest', key);
    const row = await stored(() => this.database.guestState.get(id));
    if (!row) return null;
    if (
      row.ownerId !== 'guest' ||
      row.key !== key ||
      !Number.isSafeInteger(row.version) ||
      typeof row.payload !== 'string'
    )
      throw new LocalPersistenceError('corrupt');
    if (row.version !== version) return null;
    try {
      return JSON.parse(row.payload) as unknown;
    } catch (cause) {
      throw new LocalPersistenceError('corrupt', cause);
    }
  }

  async remove(key: string): Promise<void> {
    const id = recordId('guest', key);
    await stored(() => this.database.guestState.delete(id));
  }
}

export type PendingOperationInput = Omit<
  PendingOperationRecord,
  'schemaVersion' | 'delivery'
>;

function isCurrentPending(
  row: OutboxRecord | PendingOperationRecord,
): row is PendingOperationRecord {
  return 'schemaVersion' in row && row.schemaVersion === 1;
}

function checkedOutboxRows(
  rows: (OutboxRecord | PendingOperationRecord)[],
  ownerId: string,
): (OutboxRecord | PendingOperationRecord)[] {
  for (const row of rows) {
    if (
      row.ownerId !== ownerId ||
      ('schemaVersion' in row && row.schemaVersion !== 1) ||
      (isCurrentPending(row) &&
        (row.operationType !== 'attempt-submit' ||
          typeof row.contentVersion !== 'string' ||
          typeof row.assessmentVersion !== 'string' ||
          typeof row.payload !== 'string' ||
          !Number.isSafeInteger(row.createdAt) ||
          (row.delivery !== undefined &&
            (row.delivery === null ||
              typeof row.delivery !== 'object' ||
              (row.delivery.status !== 'confirmed' &&
                row.delivery.status !== 'blocked') ||
              typeof row.delivery.message !== 'string' ||
              row.delivery.message.length > 512))))
    )
      throw new LocalPersistenceError('corrupt');
  }
  return rows;
}

export class IndexedDbPendingOperationRepository {
  constructor(private readonly database: CodeQuestDatabase = db) {}

  async enqueue(input: PendingOperationInput): Promise<void> {
    identityPart(input.eventId);
    identityPart(input.ownerId);
    identityPart(input.questId);
    boundedText(input.contentVersion, 32);
    boundedText(input.assessmentVersion, 32);
    if (
      input.operationType !== 'attempt-submit' ||
      !Number.isSafeInteger(input.createdAt) ||
      input.createdAt < 0
    )
      throw new LocalPersistenceError('invalid');
    boundedText(input.payload, LOCAL_LIMITS.pendingPayloadBytes);
    let parsed: unknown;
    try {
      parsed = JSON.parse(input.payload) as unknown;
    } catch (cause) {
      throw new LocalPersistenceError('invalid', cause);
    }
    const payload = jsonText(parsed, LOCAL_LIMITS.pendingPayloadBytes);
    if (payload !== input.payload) throw new LocalPersistenceError('invalid');
    const row: PendingOperationRecord = { ...input, schemaVersion: 1 };
    await stored(() =>
      this.database.transaction('rw', this.database.outbox, async () => {
        const previous = await this.database.outbox.get(input.eventId);
        if (previous) {
          if (
            !isCurrentPending(previous) ||
            previous.ownerId !== row.ownerId ||
            previous.questId !== row.questId ||
            previous.operationType !== row.operationType ||
            previous.contentVersion !== row.contentVersion ||
            previous.assessmentVersion !== row.assessmentVersion ||
            previous.payload !== row.payload ||
            previous.createdAt !== row.createdAt
          )
            throw new LocalPersistenceError('conflict');
          return;
        }
        await this.database.outbox.add(row);
      }),
    );
  }

  async list(ownerId: string): Promise<PendingOperationRecord[]> {
    identityPart(ownerId);
    const rows = checkedOutboxRows(
      await stored(() =>
        this.database.outbox.where('ownerId').equals(ownerId).toArray(),
      ),
      ownerId,
    );
    return rows
      .filter(isCurrentPending)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async listLegacy(ownerId: string): Promise<OutboxRecord[]> {
    identityPart(ownerId);
    const rows = checkedOutboxRows(
      await stored(() =>
        this.database.outbox.where('ownerId').equals(ownerId).toArray(),
      ),
      ownerId,
    );
    return rows.filter((row): row is OutboxRecord => !isCurrentPending(row));
  }

  async setDelivery(
    ownerId: string,
    eventId: string,
    delivery: NonNullable<PendingOperationRecord['delivery']>,
  ): Promise<void> {
    identityPart(ownerId);
    identityPart(eventId);
    if (
      (delivery.status !== 'confirmed' && delivery.status !== 'blocked') ||
      typeof delivery.message !== 'string' ||
      delivery.message.length > 512
    )
      throw new LocalPersistenceError('invalid');
    await stored(() =>
      this.database.transaction('rw', this.database.outbox, async () => {
        const row = await this.database.outbox.get(eventId);
        if (!row || !isCurrentPending(row) || row.ownerId !== ownerId)
          throw new LocalPersistenceError('conflict');
        if (row.delivery?.status === 'confirmed') return;
        await this.database.outbox.put({ ...row, delivery });
      }),
    );
  }

  async remove(ownerId: string, eventId: string): Promise<void> {
    identityPart(ownerId);
    identityPart(eventId);
    await stored(() =>
      this.database.transaction('rw', this.database.outbox, async () => {
        const row = await this.database.outbox.get(eventId);
        if (row && row.ownerId !== ownerId)
          throw new LocalPersistenceError('conflict');
        if (row && isCurrentPending(row))
          await this.database.outbox.delete(eventId);
      }),
    );
  }
}

export async function removeLocalOwnerData(
  ownerId: string,
  database: CodeQuestDatabase = db,
): Promise<void> {
  identityPart(ownerId);
  await stored(() =>
    database.transaction(
      'rw',
      database.drafts,
      database.outbox,
      database.preferences,
      database.lessonSnapshots,
      database.guestState,
      async () => {
        await database.drafts.where('ownerId').equals(ownerId).delete();
        await database.outbox.where('ownerId').equals(ownerId).delete();
        await database.preferences.where('ownerId').equals(ownerId).delete();
        await database.lessonSnapshots
          .where('ownerId')
          .equals(ownerId)
          .delete();
        if (ownerId === 'guest')
          await database.guestState.where('ownerId').equals('guest').delete();
      },
    ),
  );
}

export const workspacePreferenceRepository =
  new IndexedDbWorkspacePreferenceRepository();
