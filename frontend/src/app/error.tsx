'use client';

import { useEffect } from 'react';
import { getBrowserMonitoring } from '@/features/monitoring/browser-monitoring';
import styles from './error.module.css';

const reportedErrors = new WeakSet<Error>();

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    if (reportedErrors.has(error)) return;
    reportedErrors.add(error);
    getBrowserMonitoring()?.capture('route_render', error);
  }, [error]);
  return (
    <main role="alert" className={styles.page}>
      <div className={styles.panel}>
        <h1>Something went wrong</h1>
        <p>Your work is still on this device. Try loading this view again.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
