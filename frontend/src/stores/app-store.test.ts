import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './app-store';

describe('app store', () => {
  beforeEach(() => {
    useAppStore.setState({ sidebarOpen: false });
  });

  it('starts with the sidebar closed', () => {
    expect(useAppStore.getState().sidebarOpen).toBe(false);
  });

  it('updates sidebar state in isolation', () => {
    useAppStore.getState().setSidebarOpen(true);
    expect(useAppStore.getState().sidebarOpen).toBe(true);
  });
});
