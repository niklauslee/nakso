import { create } from "zustand";

export interface AppState {
  platform: string;
  appReady: boolean;
  showSettings: boolean;
  setPlatform(platform: string): void;
  setAppReady(ready: boolean): void;
  setShowSettings(show: boolean): void;
}

export const useAppStore = create<AppState>()((set) => ({
  platform: "unknown",
  appReady: false,
  showSettings: false,
  setPlatform: (platform) => set({ platform }),
  setAppReady: (ready) => set({ appReady: ready }),
  setShowSettings: (show) => set({ showSettings: show }),
}));
