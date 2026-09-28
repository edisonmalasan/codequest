'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui';
import {
  guestLearningRepository,
  type GuestProgress,
} from '@/features/curriculum/guest-learning';
import { createCodequestApi } from '@/lib/api-client';
import { getBrowserSupabaseClient } from './supabase-browser';

type ImportApi = Pick<
  ReturnType<typeof createCodequestApi>,
  'importGuestAttempt'
>;
type ImportOutcome =
  | 'accepted'
  | 'already-completed'
  | 'retry-required'
  | 'unavailable'
  | 'uncertain';

function currentApi(accountId: string): ImportApi {
  return createCodequestApi({
    getAccessToken: async () => {
      const { data, error } =
        await getBrowserSupabaseClient().auth.getSession();
      return error === null && data.session?.user.id === accountId
        ? data.session.access_token
        : null;
    },
  });
}

export function GuestImportPanel({
  accountId,
  api,
  repository = guestLearningRepository,
  onImported,
}: {
  accountId: string;
  api?: ImportApi;
  repository?: Pick<typeof guestLearningRepository, 'list'>;
  onImported?: () => void;
}): React.JSX.Element {
  const [records, setRecords] = useState<GuestProgress[]>([]);
  const importApi = api ?? currentApi(accountId);
  const [loadError, setLoadError] = useState(false);
  const [importing, setImporting] = useState(false);
  const [outcomes, setOutcomes] = useState<Record<string, ImportOutcome>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const generation = useRef(0);

  useEffect(() => {
    const token = ++generation.current;
    setRecords([]);
    setOutcomes({});
    setReasons({});
    setLoadError(false);
    void repository.list().then(
      (value) => {
        if (generation.current === token) setRecords(value);
      },
      () => {
        if (generation.current === token) setLoadError(true);
      },
    );
    return () => {
      generation.current += 1;
    };
  }, [accountId, repository]);

  async function importSelected(): Promise<void> {
    if (importing) return;
    const token = generation.current;
    setImporting(true);
    let anyConfirmed = false;
    try {
      for (const record of [...records].sort((a, b) =>
        a.questId.localeCompare(b.questId),
      )) {
        if (generation.current !== token) return;
        if (!record.submission) continue;
        if (
          outcomes[record.questId] === 'accepted' ||
          outcomes[record.questId] === 'already-completed'
        )
          continue;
        const { data, error } =
          await getBrowserSupabaseClient().auth.getSession();
        if (generation.current !== token) return;
        if (error || data.session?.user.id !== accountId) {
          setOutcomes((current) => ({
            ...current,
            [record.questId]: 'unavailable',
          }));
          break;
        }
        const result = await importApi.importGuestAttempt(
          record.questId,
          record.submission,
        );
        if (generation.current !== token) return;
        if (result.ok) {
          const outcome = result.data.accepted
            ? 'accepted'
            : result.data.reportedPassed
              ? 'already-completed'
              : 'retry-required';
          setOutcomes((current) => ({ ...current, [record.questId]: outcome }));
          setReasons((current) => ({ ...current, [record.questId]: '' }));
          anyConfirmed ||= outcome !== 'retry-required';
        } else {
          const outcome: ImportOutcome =
            result.kind === 'http' && result.status === 409
              ? 'retry-required'
              : result.kind === 'http' && result.status === 404
                ? 'unavailable'
                : 'uncertain';
          setOutcomes((current) => ({ ...current, [record.questId]: outcome }));
          setReasons((current) => ({
            ...current,
            [record.questId]:
              result.kind === 'http' ? result.error.message : '',
          }));
          if (
            result.kind === 'unauthenticated' ||
            result.kind === 'network' ||
            (result.kind === 'http' && result.status === 401)
          )
            break;
        }
      }
    } finally {
      if (generation.current === token) {
        setImporting(false);
        if (anyConfirmed) onImported?.();
      }
    }
  }

  const importable = records.filter((record) => record.submission);
  return (
    <section
      aria-label="Guest learning import"
      className="space-y-3 border-t border-line pt-5"
    >
      <h2 className="font-display text-xl font-bold">
        Guest learning on this device
      </h2>
      <p className="text-sm text-muted">
        Guest Checks are provisional. Import into this signed-in account only
        when you choose. The server decides acceptance, XP, unlocks, and
        streaks; old guest dates never backdate a streak. Guest code stays on
        this device.
      </p>
      {loadError && (
        <p role="alert" className="text-sm text-danger">
          Guest work could not be read from this device.
        </p>
      )}
      {!loadError && records.length === 0 && (
        <p className="text-sm text-muted">
          No saved guest work is available to import.
        </p>
      )}
      {records.map((record) => (
        <div
          key={record.questId}
          className="rounded-md border border-line p-3 text-sm"
        >
          <p className="font-bold">
            {record.questId}:{' '}
            {record.submission ? 'provisional Check saved' : 'started locally'}
          </p>
          {record.submission && (
            <>
              <p>
                Saved version {record.contentVersion} / assessment{' '}
                {record.assessmentVersion}.{' '}
                {outcomes[record.questId] ?? 'Not imported'}
              </p>
              {(outcomes[record.questId] === 'retry-required' ||
                outcomes[record.questId] === 'unavailable' ||
                outcomes[record.questId] === 'uncertain') && (
                <p className="text-danger">
                  Import needs attention. The original source is kept below;
                  reopen the current quest, edit and Check again if its
                  assessment changed.
                  {reasons[record.questId] && ` ${reasons[record.questId]}`}
                </p>
              )}
              <details className="mt-2">
                <summary>View and copy saved guest source</summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words">
                  {record.submission.source}
                </pre>
              </details>
            </>
          )}
        </div>
      ))}
      {importable.length > 0 && (
        <Button
          type="button"
          disabled={importing}
          onClick={() => void importSelected()}
        >
          {importing ? 'Importing…' : 'Import guest work into this account'}
        </Button>
      )}
    </section>
  );
}
