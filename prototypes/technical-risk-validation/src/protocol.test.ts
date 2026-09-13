import { describe, expect, it } from 'vitest';
import { byteLength, decodeResult, limits } from './protocol';

const identity = { run: 'run-1', task: 'Q01', contentVersion: '1', assessmentVersion: '1' };
const valid = { ...identity, status: 'success', output: ['Ready for CodeQuest'], value: '[undefined]' };
describe('untrusted result boundary', () => {
  it('accepts the current bounded result', () => expect(decodeResult(JSON.stringify(valid), identity)?.output).toEqual(valid.output));
  it.each(['run', 'task', 'contentVersion', 'assessmentVersion'])('rejects stale %s', (field) => expect(decodeResult(JSON.stringify({ ...valid, [field]: 'stale' }), identity)).toBeNull());
  it.each([null, {}, [], 'not json', '{"status":"accepted"}'])('rejects malformed or privileged payload %j', (raw) => expect(decodeResult(raw, identity)).toBeNull());
  it('rejects oversized UTF-8 payloads, not only character counts', () => {
    expect(byteLength('🧩')).toBe(4);
    expect(decodeResult(JSON.stringify({ ...valid, value: '🧩'.repeat(limits.message / 4) }), identity)).toBeNull();
  });
  it('rejects non-string entries and excessive entry counts', () => {
    expect(decodeResult(JSON.stringify({ ...valid, output: [{}] }), identity)).toBeNull();
    expect(decodeResult(JSON.stringify({ ...valid, output: Array.from({ length: 201 }, () => '') }), identity)).toBeNull();
  });
});
