'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  buildRepository,
  type BuildRecord,
} from '@/features/builds/build-repository';
import { useBuildOwner } from './use-build-owner';
import styles from './builds.module.css';

type LibraryState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly builds: readonly BuildRecord[] }
  | { readonly kind: 'error' };

function buildDate(value: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(value);
}

export function BuildsLibrary(): React.JSX.Element {
  const router = useRouter();
  const { owner, retry: retryOwner } = useBuildOwner();
  const [library, setLibrary] = useState<LibraryState>({ kind: 'loading' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [toRemove, setToRemove] = useState<BuildRecord | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const currentOwner = useRef<string | null>(null);

  useEffect(() => {
    currentOwner.current = owner.kind === 'ready' ? owner.ownerId : null;
    setToRemove(null);
    setMessage('');
    setBusy(false);
    if (owner.kind !== 'ready') {
      setLibrary({ kind: 'loading' });
      return;
    }
    let active = true;
    setLibrary({ kind: 'loading' });
    void buildRepository.list(owner.ownerId).then(
      (builds) => {
        if (active) setLibrary({ kind: 'ready', builds });
      },
      () => {
        if (active) setLibrary({ kind: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [owner, reloadToken]);

  async function createBuild(): Promise<void> {
    if (owner.kind !== 'ready' || busy) return;
    const ownerId = owner.ownerId;
    setBusy(true);
    setMessage('');
    try {
      const build = await buildRepository.create(ownerId);
      if (currentOwner.current === ownerId) router.push(`/builds/${build.id}`);
    } catch {
      if (currentOwner.current === ownerId)
        setMessage('This Build could not be saved on this device. Try again.');
    } finally {
      if (currentOwner.current === ownerId) setBusy(false);
    }
  }

  async function removeBuild(): Promise<void> {
    if (owner.kind !== 'ready' || !toRemove || busy) return;
    const ownerId = owner.ownerId;
    const buildId = toRemove.id;
    setBusy(true);
    setMessage('');
    try {
      const removed = await buildRepository.remove(ownerId, buildId);
      if (currentOwner.current !== ownerId) return;
      if (!removed) {
        setMessage('This Build is no longer available on this device.');
      } else {
        setLibrary((previous) =>
          previous.kind === 'ready'
            ? {
                kind: 'ready',
                builds: previous.builds.filter((build) => build.id !== buildId),
              }
            : previous,
        );
        setMessage('Build removed from this device.');
      }
      setToRemove(null);
    } catch {
      if (currentOwner.current === ownerId)
        setMessage(
          'The Build could not be removed. Its local files were kept.',
        );
    } finally {
      if (currentOwner.current === ownerId) setBusy(false);
    }
  }

  const ready = owner.kind === 'ready';
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Builds / Local workbench</p>
            <h1>Make something that moves.</h1>
            <p className={styles.lede}>
              Start with three small files. Shape a page, give it style, and
              bring it to life with the supported interactions.
            </p>
            <div className={styles.introActions}>
              <Button
                type="button"
                onClick={() => void createBuild()}
                disabled={!ready || busy || library.kind !== 'ready'}
              >
                <Plus aria-hidden="true" size={18} />
                {busy ? 'Working…' : 'New Build'}
              </Button>
              <Link href="/courses" className={styles.courseLink}>
                Explore courses <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
          <div className={styles.fileIllustration} aria-hidden="true">
            <span>index.html</span>
            <span>style.css</span>
            <span>main.js</span>
            <div className={styles.previewGlyph}>
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>

        <div className={styles.boundary}>
          <span className={styles.boundaryMarker} aria-hidden="true" />
          <p>
            Builds are saved only in this browser. Clearing browser data can
            remove them. They are private drafts, with no cloud backup or
            published page.
          </p>
        </div>

        <section aria-labelledby="your-builds" className={styles.library}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Your workbench</p>
              <h2 id="your-builds">Your Builds</h2>
            </div>
            {ready && (
              <span className={styles.ownerScope}>
                {owner.ownerId === 'guest'
                  ? 'Guest · this device'
                  : 'Account · this device'}
              </span>
            )}
          </div>

          <p role="status" aria-live="polite" className={styles.message}>
            {message}
          </p>
          {owner.kind === 'loading' && <p>Checking your local work…</p>}
          {owner.kind === 'error' && (
            <div className={styles.empty}>
              <p>
                Your local owner could not be confirmed. Builds are hidden to
                protect them.
              </p>
              <Button type="button" variant="secondary" onClick={retryOwner}>
                Retry account check
              </Button>
            </div>
          )}
          {ready && library.kind === 'loading' && (
            <p>Loading Builds from this device…</p>
          )}
          {ready && library.kind === 'error' && (
            <div className={styles.empty}>
              <p>
                Your local Builds could not be read. Existing files were not
                removed.
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setReloadToken((value) => value + 1)}
              >
                Retry local storage
              </Button>
            </div>
          )}
          {ready && library.kind === 'ready' && library.builds.length === 0 && (
            <div className={styles.empty}>
              <p>No Builds on this device yet.</p>
              <span>
                Open a fresh workbench when you are ready to experiment.
              </span>
            </div>
          )}
          {ready && library.kind === 'ready' && library.builds.length > 0 && (
            <ul className={styles.buildList}>
              {library.builds.map((build, index) => (
                <li key={build.id} className={styles.buildRow}>
                  <span className={styles.rowNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className={styles.rowMain}>
                    <Link
                      href={`/builds/${build.id}`}
                      className={styles.buildLink}
                      aria-label={`Open Web Build ${index + 1}`}
                    >
                      Web Build <ArrowUpRight aria-hidden="true" size={18} />
                    </Link>
                    <p>
                      Created{' '}
                      <time dateTime={new Date(build.createdAt).toISOString()}>
                        {buildDate(build.createdAt)}
                      </time>
                      {' · '}HTML / CSS / JavaScript
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setToRemove(build)}
                    disabled={busy}
                    aria-label={`Remove Build ${index + 1} from this device`}
                  >
                    <Trash2 aria-hidden="true" size={17} />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <Dialog
        open={toRemove !== null}
        title="Remove this Build?"
        description="This removes the Build files and preferences from this device only. It does not delete an account, cloud data, or course work."
        onClose={() => setToRemove(null)}
      >
        <div className={styles.dialogActions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setToRemove(null)}
          >
            Keep Build
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => void removeBuild()}
            disabled={busy}
          >
            Remove from device
          </Button>
        </div>
      </Dialog>
    </main>
  );
}
