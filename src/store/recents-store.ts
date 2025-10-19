import { create } from "zustand";
import { persist } from "zustand/middleware";
import { workspaceStorage } from "../lib/workspace-storage";
import { RECENTS_FILE_NAME } from "@/const";

const MAX_RECENT_FILES = 20;

export interface RecentsState {
  files: string[];
  addToRecents(path: string): void;
  removeFromRecents(path: string): void;
  replaceRecentItem(oldPath: string, newPath: string): void;
}

export const useRecentsStore = create<RecentsState>()(
  persist(
    (set) => ({
      files: [],
      addToRecents: (path: string) =>
        set((state) => {
          const files = state.files.filter((p) => p !== path);
          files.unshift(path);
          return { files: files.slice(0, MAX_RECENT_FILES) };
        }),
      removeFromRecents: (path: string) =>
        set((state) => ({
          files: state.files.filter((p) => p !== path),
        })),
      replaceRecentItem: (oldPath: string, newPath: string) =>
        set((state) => {
          const files = state.files.map((p) => (p === oldPath ? newPath : p));
          return { files };
        }),
    }),
    { name: RECENTS_FILE_NAME, storage: workspaceStorage }
  )
);
