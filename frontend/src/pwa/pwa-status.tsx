'use client';

import { useEffect, useState } from 'react';

export function mayRegisterWorker(origin: string): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  for (const compartment of [
    process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
    process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
  ]) {
    if (!compartment) continue;
    try {
      if (new URL(compartment).origin === origin) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function PwaStatus(): React.JSX.Element {
  const [online, setOnline] = useState<boolean | null>(null);
  const [update, setUpdate] = useState(false);
  const [failure, setFailure] = useState(false);
  const [progressClearFailure, setProgressClearFailure] = useState(false);

  useEffect(() => {
    let active = true;
    let registration: ServiceWorkerRegistration | undefined;
    const observed = new Set<ServiceWorker>();
    const connectivity = () => setOnline(navigator.onLine);
    const clearFailed = () => setProgressClearFailure(true);
    window.addEventListener(
      'codequest-offline-progress-clear-failed',
      clearFailed,
    );
    const inspect = () => {
      if (!active) return;
      if (registration?.waiting && navigator.serviceWorker.controller)
        setUpdate(true);
      const worker = registration?.installing;
      if (worker && !observed.has(worker)) {
        observed.add(worker);
        worker.addEventListener('statechange', inspect);
      }
      if ([...observed].some((value) => value.state === 'redundant'))
        setFailure(true);
    };
    const check = () => {
      if (
        registration &&
        navigator.onLine &&
        document.visibilityState === 'visible'
      ) {
        void registration.update().catch(() => {
          if (active) setFailure(true);
        });
      }
    };
    connectivity();
    window.addEventListener('online', connectivity);
    window.addEventListener('offline', connectivity);
    window.addEventListener('online', check);
    document.addEventListener('visibilitychange', check);
    if (
      window.isSecureContext &&
      'serviceWorker' in navigator &&
      mayRegisterWorker(window.location.origin)
    ) {
      void navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then(
          (value) => {
            if (!active) return;
            registration = value;
            registration.addEventListener('updatefound', inspect);
            inspect();
          },
          () => {
            if (active) setFailure(true);
          },
        );
    }
    return () => {
      active = false;
      window.removeEventListener(
        'codequest-offline-progress-clear-failed',
        clearFailed,
      );
      window.removeEventListener('online', connectivity);
      window.removeEventListener('offline', connectivity);
      window.removeEventListener('online', check);
      document.removeEventListener('visibilitychange', check);
      registration?.removeEventListener('updatefound', inspect);
      for (const worker of observed)
        worker.removeEventListener('statechange', inspect);
    };
  }, []);

  return (
    <aside
      aria-label="Connection and app updates"
      className="border-b border-line bg-surface px-4 py-2 text-sm text-muted"
    >
      <p role="status" aria-live="polite">
        {online === null
          ? 'Checking connection…'
          : online
            ? 'Online · account services may still be unavailable.'
            : 'Offline · account services need a connection.'}
      </p>
      {update && (
        <p role="status" className="mt-1 text-ascent">
          Update available. Save your work, close all CodeQuest tabs and app
          windows, then reopen.
        </p>
      )}
      {failure && (
        <p role="status" className="mt-1">
          Offline preparation or update check failed. You can keep using this
          page; reconnect and reopen to retry.
        </p>
      )}
      {progressClearFailure && (
        <p role="alert" className="mt-1">
          Cached progress could not be cleared from this device. Other accounts
          cannot read it; retry when device storage is available.
        </p>
      )}
    </aside>
  );
}
