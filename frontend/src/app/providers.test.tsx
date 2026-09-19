import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAppStore } from '@/stores/app-store';
import { AppProviders } from './providers';

function Probe(): React.JSX.Element {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  return <span>{sidebarOpen ? 'open' : 'closed'}</span>;
}

describe('AppProviders', () => {
  it('provides query context and client state to children', () => {
    render(
      <AppProviders>
        <Probe />
      </AppProviders>,
    );
    expect(screen.getByText('closed')).toBeDefined();
  });
});
