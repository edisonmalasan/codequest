import type { CodeQuestDatabase, DraftRecord } from '@/lib/db';
import { db } from '@/lib/db';
import { LocalPersistenceError } from '@/lib/local-persistence';

const SOURCE_LIMIT_BYTES = 65_536;

export interface DraftIdentity {
  ownerId: string;
  workspaceId: string;
}

export interface DraftSource {
  fileId: string;
  source: string;
}

export interface EditorDraftRepository {
  load(
    identity: DraftIdentity,
    fileIds: readonly string[],
  ): Promise<DraftSource[]>;
  save(identity: DraftIdentity, files: readonly DraftSource[]): Promise<void>;
}

export function createDraftId(identity: DraftIdentity, fileId: string): string {
  return [identity.ownerId, identity.workspaceId, fileId]
    .map(encodeURIComponent)
    .join(':');
}

export class IndexedDbDraftRepository implements EditorDraftRepository {
  constructor(
    private readonly database: CodeQuestDatabase = db,
    private readonly now: () => number = Date.now,
  ) {}

  async load(
    identity: DraftIdentity,
    fileIds: readonly string[],
  ): Promise<DraftSource[]> {
    if (fileIds.length === 0) return [];
    if (!identity.ownerId || !identity.workspaceId || fileIds.some((id) => !id))
      throw new LocalPersistenceError('invalid');
    const allowed = new Set(fileIds);
    let records: DraftRecord[];
    try {
      records = await this.database.drafts
        .where('[ownerId+workspaceId]')
        .equals([identity.ownerId, identity.workspaceId])
        .toArray();
    } catch (cause) {
      throw new LocalPersistenceError('unavailable', cause);
    }
    if (
      records.some(
        (record) =>
          record.ownerId !== identity.ownerId ||
          record.workspaceId !== identity.workspaceId ||
          typeof record.fileId !== 'string' ||
          typeof record.source !== 'string',
      )
    )
      throw new LocalPersistenceError('corrupt');
    return records
      .filter((record) => allowed.has(record.fileId))
      .map(({ fileId, source }) => ({ fileId, source }));
  }

  async save(
    identity: DraftIdentity,
    files: readonly DraftSource[],
  ): Promise<void> {
    if (files.length === 0) return;
    if (
      !identity.ownerId ||
      !identity.workspaceId ||
      files.some(({ fileId }) => !fileId) ||
      new Set(files.map(({ fileId }) => fileId)).size !== files.length
    )
      throw new LocalPersistenceError('invalid');
    if (
      files.some(
        ({ source }) =>
          new TextEncoder().encode(source).length > SOURCE_LIMIT_BYTES,
      )
    )
      throw new LocalPersistenceError('too-large');
    const updatedAt = this.now();
    const records: DraftRecord[] = files.map(({ fileId, source }) => ({
      id: createDraftId(identity, fileId),
      ownerId: identity.ownerId,
      workspaceId: identity.workspaceId,
      fileId,
      source,
      updatedAt,
    }));
    try {
      await this.database.transaction('rw', this.database.drafts, async () => {
        const previous = await this.database.drafts.bulkGet(
          records.map((record) => record.id),
        );
        const changed = records.filter(
          (record, index) => previous[index]?.source !== record.source,
        );
        if (changed.length) await this.database.drafts.bulkPut(changed);
      });
    } catch (cause) {
      if (cause instanceof LocalPersistenceError) throw cause;
      throw new LocalPersistenceError('unavailable', cause);
    }
  }
}

export const editorDraftRepository = new IndexedDbDraftRepository();
