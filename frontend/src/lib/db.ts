import Dexie, { type Table } from 'dexie';

export interface DraftRecord {
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
  }
}

export const db = new CodeQuestDatabase();
