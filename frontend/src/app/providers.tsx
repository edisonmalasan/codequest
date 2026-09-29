'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { ProgressSyncLifecycle } from '@/features/progress-sync/sync-provider';

export function AppProviders({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const [client] = useState(getQueryClient);
  return (
    <QueryClientProvider client={client}>
      <ProgressSyncLifecycle />
      {children}
    </QueryClientProvider>
  );
}
