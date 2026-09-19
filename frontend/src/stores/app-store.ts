import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

// Foundation-level UI state primitive proving the Zustand pattern.
// Domain state belongs to later phases under features/*.
export const useAppStore = create<AppState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open: boolean): void => {
    set({ sidebarOpen: open });
  },
}));
