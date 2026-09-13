import Dexie, { type Table } from 'dexie';
import type { Snapshot } from './mock';
import { byteLength, isRecord } from './protocol';

export type Draft = { key: string; owner: string; task: string; source: string; contentVersion: string; assessmentVersion: string; provisional: boolean };
export type DownloadedLesson = { key: string; task: string; contentVersion: string; assessmentVersion: string; objective: string; starter: string; hash: string };
class LocalLearningStore extends Dexie {
  drafts!: Table<Draft, string>;
  pending!: Table<Snapshot, string>;
  lessons!: Table<DownloadedLesson, string>;
  constructor() {
    super('codequest-risk-prototype');
    this.version(1).stores({ drafts: 'key,owner', pending: 'event,owner' });
    this.version(2).stores({ drafts: 'key,owner', pending: 'event,owner', lessons: 'key,task' });
  }
}
export function lessonKey(task: string, contentVersion: string, assessmentVersion: string): string { return `${task}/${contentVersion}/${assessmentVersion}`; }
export async function downloadLesson(task: string, contentVersion: string, assessmentVersion: string): Promise<DownloadedLesson> {
  const response = await fetch('/__lesson/' + encodeURIComponent(task));
  if (!response.ok) throw new Error('Public lesson unavailable');
  const text = await response.text();
  if (byteLength(text) > 65536) throw new Error('Public lesson exceeds prototype bound');
  const data: unknown = JSON.parse(text);
  if (!isRecord(data) || data.id !== task || data.contentVersion !== contentVersion || data.assessmentVersion !== assessmentVersion || typeof data.objective !== 'string' || typeof data.starter !== 'string') throw new Error('Public lesson identity mismatch; saved source retained');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const hash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
  const lesson = { key: lessonKey(task, contentVersion, assessmentVersion), task, contentVersion, assessmentVersion, objective: data.objective, starter: data.starter, hash };
  await store.lessons.put(lesson);
  return lesson;
}
export const store = new LocalLearningStore();
export function draftKey(owner: string, task: string): string { return owner + '/' + task; }
export async function saveDraft(draft: Draft): Promise<void> {
  const failure = sessionStorage.getItem('prototype-save-failure');
  if (failure) throw new DOMException('Injected ' + failure + ' save failure', failure === 'full' ? 'QuotaExceededError' : 'InvalidStateError');
  await store.drafts.put(draft);
}
