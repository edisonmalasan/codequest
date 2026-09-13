import Dexie, { type Table } from 'dexie';
import type { Snapshot } from './mock';

export type Draft = { key: string; owner: string; task: string; source: string; contentVersion: string; assessmentVersion: string; provisional: boolean };
class LocalLearningStore extends Dexie {
  drafts!: Table<Draft, string>;
  pending!: Table<Snapshot, string>;
  constructor() {
    super('codequest-risk-prototype');
    this.version(1).stores({ drafts: 'key,owner', pending: 'event,owner' });
  }
}
export const store = new LocalLearningStore();
export function draftKey(owner: string, task: string): string { return owner + '/' + task; }
export async function saveDraft(draft: Draft): Promise<void> {
  const failure = sessionStorage.getItem('prototype-save-failure');
  if (failure) throw new DOMException('Injected ' + failure + ' save failure', failure === 'full' ? 'QuotaExceededError' : 'InvalidStateError');
  await store.drafts.put(draft);
}
