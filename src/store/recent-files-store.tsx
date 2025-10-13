import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workspaceConfigStorage } from "./file-storage";

const MAX_RECENT_FILES = 20;

export interface RecentFilesState {
  files: string[];
  addRecentFile(path: string): void;
}

export const useRecentFilesStore = create<RecentFilesState>()(
  persist(
    (set) => ({
      files: [],
      addRecentFile: (path: string) =>
        set((state) => {
          const files = state.files.filter((p) => p !== path);
          files.unshift(path);
          return { files: files.slice(0, MAX_RECENT_FILES) };
        }),
    }),
    { name: "recents", storage: workspaceConfigStorage }
  )
);
