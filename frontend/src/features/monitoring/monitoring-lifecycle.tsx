'use client';

import { useEffect } from 'react';
import { getBrowserMonitoring } from './browser-monitoring';

export function MonitoringLifecycle(): null {
  useEffect(() => {
    const monitoring = getBrowserMonitoring();
    if (!monitoring) return;
    const onError = (event: ErrorEvent): void => {
      // Browser errors from other origins have no application provenance.
      if (event.filename) {
        try {
          if (new URL(event.filename, location.href).origin !== location.origin)
            return;
        } catch {
          return;
        }
      }
      monitoring.capture('uncaught_error', event.error);
    };
    const onRejection = (event: PromiseRejectionEvent): void => {
      monitoring.capture('unhandled_rejection', event.reason);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
