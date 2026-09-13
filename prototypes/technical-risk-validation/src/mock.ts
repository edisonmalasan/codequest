import { byteLength, isRecord } from './protocol.ts';

export type Snapshot = { event: string; owner: string; quest: string; contentVersion: string; assessmentVersion: string; source: string; passed: boolean };
export type Receipt = { status: 'accepted' | 'duplicate' | 'retry-required' | 'rejected' | 'expired'; simulatedReward: boolean; message: string };

export function snapshotFrom(raw: unknown): Snapshot | null {
  if (!isRecord(raw) || typeof raw.event !== 'string' || typeof raw.owner !== 'string' || typeof raw.quest !== 'string' || typeof raw.contentVersion !== 'string' || typeof raw.assessmentVersion !== 'string' || typeof raw.source !== 'string' || typeof raw.passed !== 'boolean') return null;
  if ([raw.event, raw.owner, raw.quest, raw.contentVersion, raw.assessmentVersion].some(value => value.length > 100) || byteLength(raw.source) > 65536) return null;
  return { event: raw.event, owner: raw.owner, quest: raw.quest, contentVersion: raw.contentVersion, assessmentVersion: raw.assessmentVersion, source: raw.source, passed: raw.passed };
}

// A simulation, not production authorization, grading or database consistency evidence.
export class SimulationLedger {
  private completions = new Set<string>();
  accept(principal: string, snapshot: Snapshot): Receipt {
    if (principal === 'expired') return { status: 'expired', simulatedReward: false, message: 'Synthetic identity expired; pending work retained' };
    if (principal === 'guest' || snapshot.owner !== principal) return { status: 'rejected', simulatedReward: false, message: 'Explicit import/owner match required' };
    if (snapshot.quest !== 'Q01' || snapshot.assessmentVersion !== '1' || !['1', 'editorial-1'].includes(snapshot.contentVersion)) return { status: 'retry-required', simulatedReward: false, message: 'Unsupported or retired version; retry without losing draft' };
    if (!snapshot.passed) return { status: 'rejected', simulatedReward: false, message: 'Local check did not pass' };
    const key = principal + '/' + snapshot.quest;
    if (this.completions.has(key)) return { status: 'duplicate', simulatedReward: false, message: 'Already simulated accepted; no additional reward' };
    this.completions.add(key);
    return { status: 'accepted', simulatedReward: true, message: 'Simulated acceptance only; not independently verified' };
  }
}
