import type { CodeQuestDatabase, DraftRecord } from '@/lib/db';
import { db } from '@/lib/db';

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
    const allowed = new Set(fileIds);
    const records = await this.database.drafts
      .where('[ownerId+workspaceId]')
      .equals([identity.ownerId, identity.workspaceId])
      .toArray();
    return records
      .filter((record) => allowed.has(record.fileId))
      .map(({ fileId, source }) => ({ fileId, source }));
  }

  async save(
    identity: DraftIdentity,
    files: readonly DraftSource[],
  ): Promise<void> {
    if (files.length === 0) return;
    const updatedAt = this.now();
    const records: DraftRecord[] = files.map(({ fileId, source }) => ({
      id: createDraftId(identity, fileId),
      ownerId: identity.ownerId,
      workspaceId: identity.workspaceId,
      fileId,
      source,
      updatedAt,
    }));
    await this.database.drafts.bulkPut(records);
  }
}

export const editorDraftRepository = new IndexedDbDraftRepository();
