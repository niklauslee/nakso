import { create } from "zustand";

export interface AppState {
  appReady: boolean;
  platform: string;
  showSettings: boolean;
  setAppReady(ready: boolean, platform: string): void;
  setShowSettings(show: boolean): void;
}

export const useAppStore = create<AppState>()((set) => ({
  appReady: false,
  platform: "unknown",
  showSettings: false,
  setAppReady: (ready, platform) => set({ appReady: ready, platform }),
  setShowSettings: (show) => set({ showSettings: show }),
}));
