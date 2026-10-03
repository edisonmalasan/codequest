'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import type { PendingOperationRecord } from '@/lib/db';
import { progressReplay, pendingSubmission } from './progress-replay';
import {
  readCapstoneResponses,
  type CapstoneResponses,
} from '@/features/curriculum/capstone-responses';
import {
  currentSyncOwner,
  ownerSyncApi,
  refreshAccountFacts,
  notifyOutbox,
  OUTBOX_CHANGED,
} from './trusted-sync';

export function PendingWorkPanel({
  accountId,
}: {
  accountId: string;
}): React.JSX.Element {
  const [rows, setRows] = useState<PendingOperationRecord[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const generation = useRef(0);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  useEffect(() => {
    const token = ++generation.current;
    setRows([]);
    setError('');
    setBusy(false);
    const load = (event?: Event) => {
      if (
        event instanceof CustomEvent &&
        typeof event.detail === 'object' &&
        event.detail !== null &&
        event.detail.ownerId === accountId &&
        event.detail.failed === true
      )
        setError(
          'Replay storage unavailable. Saved work has not been confirmed; copy source before leaving if storage is failing.',
        );
      void progressReplay.repository.list(accountId).then(
        (value) => {
          if (token === generation.current) setRows(value);
        },
        () => {
          if (token === generation.current)
            setError('Saved work could not be read from this device.');
        },
      );
    };
    load();
    window.addEventListener(OUTBOX_CHANGED, load);
    window.addEventListener('codequest-replay-finished', load);
    return () => {
      generation.current++;
      window.removeEventListener(OUTBOX_CHANGED, load);
      window.removeEventListener('codequest-replay-finished', load);
    };
  }, [accountId]);

  async function retry(): Promise<void> {
    if (busy || !navigator.onLine) return;
    const token = generation.current;
    setBusy(true);
    setError('');
    try {
      if ((await currentSyncOwner()) !== accountId)
        throw new Error('Account changed');
      if (!navigator.onLine) return;
      const result = await progressReplay.replay(
        accountId,
        ownerSyncApi(accountId),
        currentSyncOwner,
        true,
      );
      if (token !== generation.current) return;
      if (result.confirmed) refreshAccountFacts(accountId);
      if (result.pending)
        setError(
          'Delivery is pending or uncertain. Retry when connected; source is kept.',
        );
      const nextRows = await progressReplay.repository.list(accountId);
      if (token === generation.current) setRows(nextRows);
    } catch {
      if (token === generation.current)
        setError(
          'Replay unavailable. Your saved source is kept on this device.',
        );
    } finally {
      if (token === generation.current) setBusy(false);
    }
  }

  async function remove(eventId: string): Promise<void> {
    const token = generation.current;
    try {
      if ((await currentSyncOwner()) !== accountId) return;
      await progressReplay.repository.remove(accountId, eventId);
      if (token === generation.current) {
        setRows((current) => current.filter((row) => row.eventId !== eventId));
        notifyOutbox(accountId);
      }
    } catch {
      if (token === generation.current)
        setError('Saved work could not be removed.');
    }
  }

  return (
    <section
      aria-label="Pending account work"
      className="space-y-3 border-t border-line pt-5"
    >
      <h2 className="font-sans text-xl font-bold tracking-tight">
        Submissions on this device
      </h2>
      <p className="text-sm text-muted">
        Pending work is provisional until the backend decides. Reconnect sends
        only this account's saved submissions. Drafts stay on this device;
        clearing browser data can erase pending source. Offline activity never
        backdates a streak.
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {!online && (
        <p role="status" className="text-sm">
          Offline. Saved submissions remain on this device until connected;
          account facts are unavailable.
        </p>
      )}
      {rows.length === 0 && (
        <p className="text-sm">No saved submissions on this device.</p>
      )}
      {rows.map((row) => {
        let source: string;
        let responses: CapstoneResponses | null = null;
        try {
          const snapshot = pendingSubmission(row);
          source = snapshot.source;
          responses = readCapstoneResponses(snapshot.report.capstoneResponses);
        } catch {
          source = row.payload;
        }
        return (
          <div
            key={row.eventId}
            className="rounded-md border border-line bg-surface-sunken p-4 text-sm"
          >
            <p className="font-bold">
              {row.questId}:{' '}
              {row.delivery?.status === 'confirmed'
                ? 'delivery confirmed'
                : row.delivery?.status === 'blocked'
                  ? 'needs attention'
                  : 'pending / response uncertain'}
            </p>
            <p>
              Version {row.contentVersion} / assessment {row.assessmentVersion}.{' '}
              {row.delivery?.message}
            </p>
            <details>
              <summary>View and copy saved submission source</summary>
              <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                {source}
              </pre>
              {responses && (
                <div className="mt-3 space-y-2">
                  <p className="font-bold">Debug explanation</p>
                  <p className="whitespace-pre-wrap break-words">
                    {responses.explanation}
                  </p>
                  <p className="font-bold">Transfer response</p>
                  <p className="whitespace-pre-wrap break-words">
                    {responses.transfer}
                  </p>
                </div>
              )}
            </details>
            <Button
              type="button"
              disabled={busy}
              onClick={() => void remove(row.eventId)}
            >
              Remove this device copy
            </Button>
          </div>
        );
      })}
      {rows.some((row) => row.delivery?.status !== 'confirmed') && (
        <Button
          type="button"
          disabled={busy || !online}
          onClick={() => void retry()}
        >
          {busy ? 'Retrying saved work…' : 'Retry saved submissions'}
        </Button>
      )}
    </section>
  );
}
