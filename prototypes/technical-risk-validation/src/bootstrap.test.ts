import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';

type Packet = { data: unknown };

function bootstrapFixture() {
  const events: string[] = [];
  const workers: FixtureWorker[] = [];
  const owner = { postMessage: () => { events.push('deliver'); } };
  const control: { onmessage: ((event: Packet) => void) | null; postMessage: () => void } = { onmessage: null, postMessage: () => { events.push('ack'); } };
  let receive: ((event: { source: typeof owner; data: string; ports: typeof control[] }) => void) | undefined;
  class FixtureWorker {
    onmessage: ((event: Packet) => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() { workers.push(this); }
    postMessage() { events.push('start'); }
    terminate() { events.push('terminate'); }
  }
  runInNewContext(readFileSync(new URL('../public/opaque-bootstrap.js', import.meta.url), 'utf8'), {
    parent: owner, TextEncoder, Blob, Worker: FixtureWorker,
    URL: { createObjectURL: () => 'blob:public-fixture', revokeObjectURL: () => { events.push('revoke'); } },
    bootstrapId: 'public-fixture', publicWorkerSource: 'public-fixture',
    addEventListener: (_type: string, handler: typeof receive) => { receive = handler; },
  });
  receive?.({ source: owner, data: 'connect-private-control', ports: [control] });
  const identity = { run: 'run-fixture', task: 'Q01', contentVersion: '1', assessmentVersion: '1' };
  control.onmessage?.({ data: { type: 'start', input: { ...identity, source: 'public-fixture', previewMarker: true } } });
  events.length = 0;
  const worker = workers[0];
  if (!worker) throw new Error('Fixture Worker was not created');
  return { events, worker, control, identity };
}

test('trusted bootstrap terminates terminal output before delivery and still privately acknowledges cleanup', () => {
  const fixture = bootstrapFixture();
  fixture.worker.onmessage?.({ data: JSON.stringify({ ...fixture.identity, status: 'success', output: [], value: 'done' }) });
  expect(fixture.events).toEqual(['terminate', 'deliver']);
  expect(fixture.worker.onmessage).toBeNull();
  fixture.control.onmessage?.({ data: { type: 'stop', ticket: 'cleanup-fixture', identity: fixture.identity } });
  expect(fixture.events).toEqual(['terminate', 'deliver', 'ack']);
});

test('execution start marker keeps Worker active; subsequent malformed output terminates it', () => {
  const fixture = bootstrapFixture();
  fixture.worker.onmessage?.({ data: fixture.identity.run + ':preview-started' });
  expect(fixture.events).toEqual(['deliver']);
  fixture.worker.onmessage?.({ data: 'malformed-untrusted-output' });
  expect(fixture.events).toEqual(['deliver', 'terminate', 'deliver']);
});
