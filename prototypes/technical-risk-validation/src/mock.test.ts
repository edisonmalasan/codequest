import { describe, expect, it } from 'vitest';
import { SimulationLedger, snapshotFrom, type Snapshot } from './mock';

const snapshot: Snapshot = { event: 'one', owner: 'account-A', quest: 'Q01', contentVersion: '1', assessmentVersion: '1', source: 'console.log("Ready for CodeQuest")', passed: true };
describe('synthetic acceptance semantics only', () => {
  it('deduplicates stable quest reward even with a fresh event/version', () => {
    const ledger = new SimulationLedger();
    expect(ledger.accept('account-A', snapshot).simulatedReward).toBe(true);
    expect(ledger.accept('account-A', { ...snapshot, event: 'two', contentVersion: 'editorial-1' })).toMatchObject({ status: 'duplicate', simulatedReward: false });
  });
  it('rejects cross-owner, guest and expired requests', () => {
    const ledger = new SimulationLedger();
    expect(ledger.accept('account-B', snapshot).status).toBe('rejected');
    expect(ledger.accept('guest', snapshot).status).toBe('rejected');
    expect(ledger.accept('expired', snapshot).status).toBe('expired');
  });
  it('requires supported assessment and preserves input on rejection', () => {
    const input = { ...snapshot, assessmentVersion: 'retired' };
    expect(new SimulationLedger().accept('account-A', input).status).toBe('retry-required');
    expect(input.source).toBe(snapshot.source);
    expect(input.assessmentVersion).toBe('retired');
    expect(new SimulationLedger().accept('account-A', { ...snapshot, contentVersion: 'unknown' }).status).toBe('retry-required');
  });
  it('permits explicit guest import without mutating the original snapshot', () => {
    const guest = { ...snapshot, owner: 'guest' };
    expect(new SimulationLedger().accept('account-A', { ...guest, owner: 'account-A' }).status).toBe('accepted');
    expect(guest.owner).toBe('guest');
  });
  it('honestly accepts a forged pass under personal-learning trust', () => {
    expect(new SimulationLedger().accept('account-A', { ...snapshot, source: 'throw Error("not correct")' }).status).toBe('accepted');
  });
  it('rejects malformed snapshot input', () => {
    expect(snapshotFrom({ ...snapshot, source: null })).toBeNull();
    expect(snapshotFrom({ ...snapshot, event: 'x'.repeat(101) })).toBeNull();
    expect(snapshotFrom({ ...snapshot, source: '界'.repeat(22000) })).toBeNull();
  });
});
