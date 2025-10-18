import { create } from "zustand";

export interface AppState {
  appReady: boolean;
  platform: string;
  setAppReady(ready: boolean, platform: string): void;
}

export const useAppStore = create<AppState>()((set) => ({
  appReady: false,
  platform: "unknown",
  setAppReady: (ready, platform) => set({ appReady: ready, platform }),
}));
