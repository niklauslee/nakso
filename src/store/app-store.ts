import { create } from "zustand";

type ViewType =
  | "editor"
  | "folder"
  | "search"
  | "recents"
  | "favorites"
  | "settings";

export interface AppState {
  appReady: boolean;
  platform: string;
  view: ViewType;
  setAppReady(ready: boolean, platform: string): void;
  setView(view: ViewType): void;
}

export const useAppStore = create<AppState>()((set) => ({
  appReady: false,
  platform: "unknown",
  view: "editor",
  setAppReady: (ready, platform) => set({ appReady: ready, platform }),
  setView: (view) => set({ view }),
}));
