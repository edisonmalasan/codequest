import Dexie, { type Table } from 'dexie';

export interface DraftRecord {
  id: string;
  ownerId: string;
  workspaceId: string;
  fileId: string;
  source: string;
  updatedAt: number;
}

interface LegacyDraftRecord {
  id: string;
  ownerId: string;
  questId: string;
  source: string;
  updatedAt: number;
}

export interface OutboxRecord {
  eventId: string;
  ownerId: string;
  questId: string;
  contentVersion: number;
  payload: string;
  createdAt: number;
}

// Local-persistence skeleton for P08 drafts/outbox vocabulary.
// Provisional schema only: sync, merge, and acceptance logic belong to later
// phases (F03 defers the sync mechanism). Tables are owner-isolated by index.
export class CodeQuestDatabase extends Dexie {
  drafts!: Table<DraftRecord, string>;
  outbox!: Table<OutboxRecord, string>;

  constructor(name = 'codequest') {
    super(name);
    this.version(1).stores({
      drafts: 'id, [ownerId+questId]',
      outbox: 'eventId, ownerId',
    });
    this.version(2)
      .stores({
        drafts:
          'id, [ownerId+workspaceId+fileId], [ownerId+workspaceId], updatedAt',
        outbox: 'eventId, ownerId',
      })
      .upgrade((transaction) =>
        transaction
          .table<LegacyDraftRecord | DraftRecord, string>('drafts')
          .toCollection()
          .modify((draft) => {
            if ('workspaceId' in draft && 'fileId' in draft) return;
            Object.assign(draft, {
              workspaceId: draft.questId,
              fileId: 'main',
            });
          }),
      );
  }
}

export const db = new CodeQuestDatabase();
