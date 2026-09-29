import Dexie, { type Table } from 'dexie';
import type { QuestDetail } from './api-client';

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

export interface PendingOperationRecord {
  eventId: string;
  ownerId: string;
  questId: string;
  schemaVersion: 1;
  operationType: 'attempt-submit';
  contentVersion: string;
  assessmentVersion: string;
  payload: string;
  createdAt: number;
  delivery?: { status: 'confirmed' | 'blocked'; message: string };
}

export interface WorkspacePreferenceRecord {
  id: string;
  ownerId: string;
  workspaceId: string;
  activeFileId: string;
  updatedAt: number;
}

export interface LessonSnapshotRecord {
  id: string;
  ownerId: string;
  questId: string;
  contentVersion: string;
  assessmentVersion: string;
  snapshot: QuestDetail;
  savedAt: number;
  assetPaths?: string[];
}

export interface LessonAssetRecord {
  id: string;
  ownerId: string;
  questId: string;
  contentVersion: string;
  assessmentVersion: string;
  path: string;
  blob: Blob;
}

export interface AcceptedProgressRecord {
  id: string;
  ownerId: string;
  journeyId: string;
  capturedAt: number;
  schemaVersion: 1;
  quests: {
    questId: string;
    contentVersion: string;
    assessmentVersion: string;
    status: 'not_started' | 'in_progress' | 'completed';
    availability: 'available' | 'locked';
  }[];
}

export interface GuestStateRecord {
  id: string;
  ownerId: 'guest';
  key: string;
  version: number;
  payload: string;
  updatedAt: number;
}

// Legacy outbox
// rows have no schemaVersion and are never treated as replay-ready envelopes.
export class CodeQuestDatabase extends Dexie {
  drafts!: Table<DraftRecord, string>;
  outbox!: Table<OutboxRecord | PendingOperationRecord, string>;
  preferences!: Table<WorkspacePreferenceRecord, string>;
  lessonSnapshots!: Table<LessonSnapshotRecord, string>;
  lessonAssets!: Table<LessonAssetRecord, string>;
  acceptedProgress!: Table<AcceptedProgressRecord, string>;
  guestState!: Table<GuestStateRecord, string>;

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
    this.version(3).stores({
      drafts:
        'id, [ownerId+workspaceId+fileId], [ownerId+workspaceId], updatedAt',
      outbox: 'eventId, ownerId, [ownerId+createdAt]',
      preferences: 'id, [ownerId+workspaceId], ownerId',
      lessonSnapshots:
        'id, [ownerId+questId], [ownerId+questId+contentVersion+assessmentVersion]',
      guestState: 'id, [ownerId+key]',
    });
    this.version(4).stores({
      drafts:
        'id, [ownerId+workspaceId+fileId], [ownerId+workspaceId], updatedAt',
      outbox: 'eventId, ownerId, [ownerId+createdAt]',
      preferences: 'id, [ownerId+workspaceId], ownerId',
      lessonSnapshots:
        'id, ownerId, [ownerId+questId], [ownerId+questId+contentVersion+assessmentVersion]',
      lessonAssets:
        'id, ownerId, [ownerId+questId+contentVersion+assessmentVersion]',
      acceptedProgress: 'id, ownerId',
      guestState: 'id, [ownerId+key]',
    });
  }
}

export const db = new CodeQuestDatabase();
