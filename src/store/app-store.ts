import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AppState {
  appReady: boolean;
  platform: string;
  setAppReady(ready: boolean, platform: string): void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      appReady: false,
      platform: "unknown",
      setAppReady: (ready, platform) => set({ appReady: ready, platform }),
    }),
    { name: "AppStore" }
  )
);
