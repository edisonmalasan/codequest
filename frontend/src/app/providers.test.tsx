import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/app-store';
import { AppProviders } from './providers';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('@/features/progress-sync/sync-provider', () => ({
  ProgressSyncLifecycle: () => <span>sync lifecycle</span>,
}));
vi.mock('@/features/monitoring/monitoring-lifecycle', () => ({
  MonitoringLifecycle: () => <span>monitoring lifecycle</span>,
}));

function Probe(): React.JSX.Element {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  return <span>{sidebarOpen ? 'open' : 'closed'}</span>;
}

describe('AppProviders', () => {
  beforeEach(() => vi.mocked(usePathname).mockReturnValue('/'));

  it('provides query context and client state to children', () => {
    render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByText('closed')).toBeDefined();
    expect(screen.getByText('sync lifecycle')).toBeDefined();
    expect(screen.getByText('monitoring lifecycle')).toBeDefined();
  });

  it('keeps account sync and monitoring out of the development design preview', () => {
    vi.mocked(usePathname).mockReturnValue('/design-direction');
    render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByText('closed')).toBeDefined();
    expect(screen.queryByText('sync lifecycle')).toBeNull();
    expect(screen.queryByText('monitoring lifecycle')).toBeNull();
  });
});
