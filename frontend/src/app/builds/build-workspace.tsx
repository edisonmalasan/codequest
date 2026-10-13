'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { Button } from '@/components/ui/button';
import { EditorWorkspace, type SaveStatus } from '@/features/editor';
import {
  IsolatedInteractiveWebAdapter,
  resolveInteractiveOrigins,
  type InteractiveWebAdapter,
} from '@/features/interactive';
import { BoundedBuildAdapter } from '@/features/builds/build-interactive-adapter';
import {
  buildRepository,
  type BuildRecord,
} from '@/features/builds/build-repository';
import {
  BUILD_CONTENT_VERSION,
  BUILD_STARTER_FILES,
} from '@/features/builds/build-starter';
import { useBuildOwner } from './use-build-owner';
import styles from './build-workspace.module.css';

type BuildState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly build: BuildRecord }
  | { readonly kind: 'missing' }
  | { readonly kind: 'error' };

export function BuildWorkspace({
  buildId,
}: {
  readonly buildId: string;
}): React.JSX.Element {
  const { owner, retry: retryOwner } = useBuildOwner();
  const [buildState, setBuildState] = useState<BuildState>({ kind: 'loading' });
  const [adapterState, setAdapterState] = useState<{
    readonly ownerId: string;
    readonly buildId: string;
    readonly adapter: InteractiveWebAdapter;
  }>();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading');
  const [navigationMessage, setNavigationMessage] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setNavigationMessage('');
    setSaveStatus('loading');
    if (owner.kind !== 'ready') {
      setBuildState({ kind: 'loading' });
      return;
    }
    let active = true;
    setBuildState({ kind: 'loading' });
    void buildRepository.load(owner.ownerId, buildId).then(
      (build) => {
        if (!active) return;
        setBuildState(build ? { kind: 'ready', build } : { kind: 'missing' });
      },
      () => {
        if (active) setBuildState({ kind: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [owner, buildId, reloadToken]);

  const build =
    owner.kind === 'ready' &&
    buildState.kind === 'ready' &&
    buildState.build.ownerId === owner.ownerId &&
    buildState.build.id === buildId
      ? buildState.build
      : null;
  const adapter =
    build &&
    adapterState?.ownerId === build.ownerId &&
    adapterState.buildId === build.id
      ? adapterState.adapter
      : undefined;

  useEffect(() => {
    if (!build) {
      setAdapterState(undefined);
      return;
    }
    const origins = resolveInteractiveOrigins(
      window.location.origin,
      process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
      process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
    );
    if (!origins) {
      setAdapterState(undefined);
      return;
    }
    const next = new BoundedBuildAdapter(
      new IsolatedInteractiveWebAdapter(
        origins.runnerOrigin,
        origins.previewOrigin,
      ),
    );
    setAdapterState({
      ownerId: build.ownerId,
      buildId: build.id,
      adapter: next,
    });
    return () => {
      void next.dispose();
    };
  }, [build]);

  function guardBack(event: MouseEvent<HTMLAnchorElement>): void {
    if (saveStatus === 'saved' || saveStatus === 'ready') return;
    event.preventDefault();
    setNavigationMessage(
      saveStatus === 'failed'
        ? 'Your latest edits are only in memory. Retry Save before leaving this Build.'
        : 'Wait for the device-local save to finish before leaving this Build.',
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" aria-label="CodeQuest home" className={styles.logo}>
          <CodeQuestLogo />
        </Link>
        <div className={styles.heading}>
          <span>Builds / Workbench</span>
          <h1>Web Build</h1>
        </div>
        <Link href="/builds" onClick={guardBack} className={styles.back}>
          <ArrowLeft aria-hidden="true" size={17} />
          All Builds
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.note}>
          <p>
            <strong>Saved on this device.</strong> This Build is private and has
            no cloud backup. Run shows a bounded local preview; it does not
            check course work or publish a page.
          </p>
          <span>HTML / CSS / JavaScript</span>
        </div>
        {navigationMessage && (
          <p role="status" className={styles.warning}>
            {navigationMessage}
          </p>
        )}

        {owner.kind === 'loading' && (
          <p role="status">Checking your local work…</p>
        )}
        {owner.kind === 'error' && (
          <div className={styles.notice}>
            <p>
              Your local owner could not be confirmed. This Build is hidden to
              protect it.
            </p>
            <Button type="button" variant="secondary" onClick={retryOwner}>
              Retry account check
            </Button>
          </div>
        )}
        {owner.kind === 'ready' && buildState.kind === 'loading' && (
          <p role="status">Loading this Build from your device…</p>
        )}
        {owner.kind === 'ready' && buildState.kind === 'missing' && (
          <div className={styles.notice}>
            <p>This Build is not available in this local owner scope.</p>
            <Link href="/builds">Return to your Builds</Link>
          </div>
        )}
        {owner.kind === 'ready' && buildState.kind === 'error' && (
          <div className={styles.notice}>
            <p>
              This Build could not be opened. Its stored files were not removed.
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
        {build && (
          <div className={styles.workspace}>
            <EditorWorkspace
              key={`${build.ownerId}:${build.id}`}
              ownerId={build.ownerId}
              workspaceId={build.workspaceId}
              files={BUILD_STARTER_FILES}
              interactiveAdapter={adapter}
              interactiveContentVersion={BUILD_CONTENT_VERSION}
              interactiveLabels={{
                title: 'Build preview',
                run: 'Run Build',
                reload: 'Reload Build',
                cancel: 'Cancel Build',
              }}
              workspaceTitle="Build workspace"
              presentation="integrated"
              showTestResults={false}
              runtimeState={
                adapter
                  ? {
                      kind: 'idle',
                      label: 'Run Build to inspect this project.',
                    }
                  : {
                      kind: 'unavailable',
                      label: 'Isolated preview origins are unavailable.',
                    }
              }
              onSaveStatusChange={setSaveStatus}
            />
            <p className={styles.supportNote}>
              Supports text, classes, selected attributes and styles, and
              click/input/change events. Browser networking, storage,
              navigation, timers, imports, and full DOM APIs are unavailable.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
