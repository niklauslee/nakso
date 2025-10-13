import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workspaceStorage } from "./workspace-storage";

const MAX_RECENT_FILES = 20;

export interface RecentFilesState {
  files: string[];
  addToRecents(path: string): void;
}

export const useRecentFilesStore = create<RecentFilesState>()(
  persist(
    (set) => ({
      files: [],
      addToRecents: (path: string) =>
        set((state) => {
          const files = state.files.filter((p) => p !== path);
          files.unshift(path);
          return { files: files.slice(0, MAX_RECENT_FILES) };
        }),
    }),
    { name: "recents", storage: workspaceStorage }
  )
);
