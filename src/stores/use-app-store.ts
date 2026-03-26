import { create } from "zustand";

interface AppState {
  isAppReady: boolean;
  setAppReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isAppReady: false,
  setAppReady: (ready) => set({ isAppReady: ready }),
}));
