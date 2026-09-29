import {
  isQuestDetail,
  type JourneyProgress,
  type QuestDetail,
} from './api-client';
import {
  db,
  type CodeQuestDatabase,
  type GuestStateRecord,
  type LessonSnapshotRecord,
  type LessonAssetRecord,
  type AcceptedProgressRecord,
  type OutboxRecord,
  type PendingOperationRecord,
  type WorkspacePreferenceRecord,
} from './db';

export const LOCAL_LIMITS = {
  preferenceBytes: 4_096,
  lessonBytes: 262_144,
  lessonAssetBytes: 524_288,
  lessonAssetsBytes: 2_097_152,
  progressBytes: 32_768,
  guestValueBytes: 16_384,
  pendingPayloadBytes: 65_536,
} as const;

export type LocalPersistenceErrorKind =
  'invalid' | 'too-large' | 'unavailable' | 'quota' | 'conflict' | 'corrupt';

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
    if (
      typeof cause === 'object' &&
      cause !== null &&
      'name' in cause &&
      cause.name === 'QuotaExceededError'
    )
      throw new LocalPersistenceError('quota', cause);
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
    const row = this.checkedRow(ownerId, snapshot);
    await stored(() => this.database.lessonSnapshots.put(row));
  }

  private checkedRow(
    ownerId: string,
    snapshot: QuestDetail,
    assetPaths?: string[],
  ): LessonSnapshotRecord {
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
    return {
      id,
      ownerId,
      questId: snapshot.id,
      contentVersion: snapshot.contentVersion,
      assessmentVersion: snapshot.assessmentVersion,
      snapshot: parsed,
      savedAt: this.now(),
      ...(assetPaths === undefined ? {} : { assetPaths }),
    };
  }

  async saveDownloaded(
    ownerId: string,
    snapshot: QuestDetail,
    assets: ReadonlyMap<string, Blob>,
  ): Promise<void> {
    if (assets.size > 8) throw new LocalPersistenceError('too-large');
    let bytes = 0;
    const assetPaths = [...assets.keys()].sort();
    const row = this.checkedRow(ownerId, snapshot, assetPaths);
    const records: LessonAssetRecord[] = [];
    for (const [assetPath, blob] of assets) {
      if (
        !/^assets\/[a-zA-Z0-9/_-]+\.(?:png|webp)$/.test(assetPath) ||
        !(blob instanceof Blob) ||
        !['image/png', 'image/webp'].includes(blob.type) ||
        blob.size === 0 ||
        blob.size > LOCAL_LIMITS.lessonAssetBytes
      )
        throw new LocalPersistenceError('invalid');
      bytes += blob.size;
      if (bytes > LOCAL_LIMITS.lessonAssetsBytes)
        throw new LocalPersistenceError('too-large');
      records.push({
        id: recordId(
          ownerId,
          snapshot.id,
          snapshot.contentVersion,
          snapshot.assessmentVersion,
          assetPath,
        ),
        ownerId,
        questId: snapshot.id,
        contentVersion: snapshot.contentVersion,
        assessmentVersion: snapshot.assessmentVersion,
        path: assetPath,
        blob,
      });
    }
    await stored(() =>
      this.database.transaction(
        'rw',
        this.database.lessonSnapshots,
        this.database.lessonAssets,
        async () => {
          const existing = await this.database.lessonSnapshots
            .where('ownerId')
            .equals(ownerId)
            .toArray();
          if (
            !existing.some((item) => item.id === row.id) &&
            existing.length >= 8
          )
            throw new LocalPersistenceError('too-large');
          await this.database.lessonAssets
            .where('[ownerId+questId+contentVersion+assessmentVersion]')
            .equals([
              ownerId,
              snapshot.id,
              snapshot.contentVersion,
              snapshot.assessmentVersion,
            ])
            .delete();
          await this.database.lessonAssets.bulkPut(records);
          await this.database.lessonSnapshots.put(row);
        },
      ),
    );
  }

  async listDownloaded(ownerId: string): Promise<LessonSnapshotRecord[]> {
    identityPart(ownerId);
    const rows = await stored(() =>
      this.database.lessonSnapshots.where('ownerId').equals(ownerId).toArray(),
    );
    for (const row of rows) {
      if (
        row.ownerId !== ownerId ||
        !isQuestDetail(row.snapshot) ||
        row.questId !== row.snapshot.id ||
        row.contentVersion !== row.snapshot.contentVersion ||
        row.assessmentVersion !== row.snapshot.assessmentVersion ||
        !Number.isFinite(row.savedAt) ||
        (row.assetPaths !== undefined &&
          (!Array.isArray(row.assetPaths) ||
            row.assetPaths.length > 8 ||
            row.assetPaths.some((path) => typeof path !== 'string')))
      )
        throw new LocalPersistenceError('corrupt');
      jsonText(publicLessonSnapshot(row.snapshot), LOCAL_LIMITS.lessonBytes);
    }
    return rows
      .filter((row) => row.assetPaths !== undefined)
      .sort((a, b) => b.savedAt - a.savedAt);
  }

  async loadDownloaded(
    ownerId: string,
    questId: string,
    contentVersion: string,
    assessmentVersion: string,
  ): Promise<{
    snapshot: QuestDetail;
    assets: ReadonlyMap<string, Blob>;
    savedAt: number;
  } | null> {
    const id = recordId(ownerId, questId, contentVersion, assessmentVersion);
    const row = await stored(() => this.database.lessonSnapshots.get(id));
    if (!row) return null;
    const snapshot = await this.load(
      ownerId,
      questId,
      contentVersion,
      assessmentVersion,
    );
    if (
      !snapshot ||
      !Number.isFinite(row.savedAt) ||
      !Array.isArray(row.assetPaths)
    )
      throw new LocalPersistenceError('corrupt');
    jsonText(publicLessonSnapshot(snapshot), LOCAL_LIMITS.lessonBytes);
    if (
      row.assetPaths.length > 8 ||
      new Set(row.assetPaths).size !== row.assetPaths.length ||
      row.assetPaths.some(
        (path) => !/^assets\/[a-zA-Z0-9/_-]+\.(?:png|webp)$/.test(path),
      )
    )
      throw new LocalPersistenceError('corrupt');
    const records = await stored(() =>
      this.database.lessonAssets
        .where('[ownerId+questId+contentVersion+assessmentVersion]')
        .equals([ownerId, questId, contentVersion, assessmentVersion])
        .toArray(),
    );
    const assets = new Map<string, Blob>();
    let bytes = 0;
    for (const record of records) {
      if (
        record.ownerId !== ownerId ||
        record.questId !== questId ||
        record.contentVersion !== contentVersion ||
        record.assessmentVersion !== assessmentVersion ||
        !row.assetPaths.includes(record.path) ||
        !(record.blob instanceof Blob) ||
        !['image/png', 'image/webp'].includes(record.blob.type) ||
        record.blob.size > LOCAL_LIMITS.lessonAssetBytes
      )
        throw new LocalPersistenceError('corrupt');
      bytes += record.blob.size;
      assets.set(record.path, record.blob);
    }
    if (
      assets.size !== row.assetPaths.length ||
      bytes > LOCAL_LIMITS.lessonAssetsBytes
    )
      throw new LocalPersistenceError('corrupt');
    return { snapshot, assets, savedAt: row.savedAt };
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
    await stored(() =>
      this.database.transaction(
        'rw',
        this.database.lessonSnapshots,
        this.database.lessonAssets,
        async () => {
          const row = await this.database.lessonSnapshots.get(id);
          if (row && row.ownerId !== ownerId)
            throw new LocalPersistenceError('conflict');
          await this.database.lessonAssets
            .where('[ownerId+questId+contentVersion+assessmentVersion]')
            .equals([ownerId, questId, contentVersion, assessmentVersion])
            .delete();
          await this.database.lessonSnapshots.delete(id);
        },
      ),
    );
  }
}

export class IndexedDbAcceptedProgressRepository {
  constructor(
    private readonly database: CodeQuestDatabase = db,
    private readonly now: () => number = Date.now,
  ) {}

  async save(
    ownerId: string,
    progress: JourneyProgress,
    versions: readonly {
      questId: string;
      contentVersion: string;
      assessmentVersion: string;
    }[],
  ): Promise<void> {
    identityPart(ownerId);
    if (ownerId === 'guest') throw new LocalPersistenceError('invalid');
    identityPart(progress.journeyId);
    const versionMap = new Map(versions.map((item) => [item.questId, item]));
    const questFacts = progress.chapters.flatMap((chapter) => chapter.quests);
    if (
      questFacts.length > 128 ||
      questFacts.length !== versions.length ||
      versionMap.size !== versions.length
    )
      throw new LocalPersistenceError('invalid');
    const quests: AcceptedProgressRecord['quests'] = questFacts.map((fact) => {
      const version = versionMap.get(fact.questId);
      if (
        !version ||
        !['not_started', 'in_progress', 'completed'].includes(fact.status) ||
        !['available', 'locked'].includes(fact.availability)
      )
        throw new LocalPersistenceError('invalid');
      identityPart(version.contentVersion);
      identityPart(version.assessmentVersion);
      return {
        questId: fact.questId,
        contentVersion: version.contentVersion,
        assessmentVersion: version.assessmentVersion,
        status: fact.status,
        availability: fact.availability,
      };
    });
    const row: AcceptedProgressRecord = {
      id: recordId(ownerId, progress.journeyId),
      ownerId,
      journeyId: progress.journeyId,
      capturedAt: this.now(),
      schemaVersion: 1,
      quests,
    };
    jsonText(row, LOCAL_LIMITS.progressBytes);
    await stored(() => this.database.acceptedProgress.put(row));
  }

  async load(
    ownerId: string,
    journeyId: string,
  ): Promise<AcceptedProgressRecord | null> {
    const id = recordId(ownerId, journeyId);
    const row = await stored(() => this.database.acceptedProgress.get(id));
    if (!row) return null;
    if (
      row.ownerId !== ownerId ||
      row.journeyId !== journeyId ||
      row.schemaVersion !== 1 ||
      !Number.isFinite(row.capturedAt) ||
      !Array.isArray(row.quests) ||
      row.quests.length > 128 ||
      row.quests.some(
        (quest) =>
          typeof quest.questId !== 'string' ||
          typeof quest.contentVersion !== 'string' ||
          typeof quest.assessmentVersion !== 'string' ||
          !['not_started', 'in_progress', 'completed'].includes(quest.status) ||
          !['available', 'locked'].includes(quest.availability),
      )
    )
      throw new LocalPersistenceError('corrupt');
    jsonText(row, LOCAL_LIMITS.progressBytes);
    return row;
  }

  async clear(ownerId: string): Promise<void> {
    identityPart(ownerId);
    await stored(() =>
      this.database.acceptedProgress.where('ownerId').equals(ownerId).delete(),
    );
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
      [
        database.drafts,
        database.outbox,
        database.preferences,
        database.lessonSnapshots,
        database.lessonAssets,
        database.acceptedProgress,
        database.guestState,
      ],
      async () => {
        await database.drafts.where('ownerId').equals(ownerId).delete();
        await database.outbox.where('ownerId').equals(ownerId).delete();
        await database.preferences.where('ownerId').equals(ownerId).delete();
        await database.lessonSnapshots
          .where('ownerId')
          .equals(ownerId)
          .delete();
        await database.lessonAssets.where('ownerId').equals(ownerId).delete();
        await database.acceptedProgress
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
export const lessonSnapshotRepository = new IndexedDbLessonSnapshotRepository();
export const acceptedProgressRepository =
  new IndexedDbAcceptedProgressRepository();
