import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const MAX_RECENT_FILES = 10;

// Rename to 'WorkspaceStore'.
// Make this store as persistent.
// 0. workspacePath: string | null
// 1. workingFile: string | null
// 2. workingFolder: string | null
// 3. recentFiles
// 4. favoriteFiles

export interface WorkingState {
  workspacePath: string | null;
  workingFile: string | null;
  workingFolder: string | null;
  recentFiles: string[];
  favoriteFiles: string[];
  setWorkingFile: (file: string | null) => void;
  setWorkingFolder: (folder: string | null) => void;
  addRecentFile: (file: string) => void;
}

export const useWorkingStore = create<WorkingState>()(
  devtools(
    persist(
      (set) => ({
        workspacePath: null,
        workingFile: null,
        workingFolder: null,
        recentFiles: [],
        favoriteFiles: [],
        setWorkingFile: (file) => set(() => ({ workingFile: file })),
        setWorkingFolder: (folder) => set(() => ({ workingFolder: folder })),
        addRecentFile: (file) =>
          set((state) => {
            const recentFiles = state.recentFiles.filter((f) => f !== file);
            recentFiles.unshift(file);
            if (recentFiles.length > MAX_RECENT_FILES) {
              recentFiles.pop();
            }
            return { recentFiles };
          }),
      }),
      { name: "working-storage" }
    ),
    { name: "WorkingStore" }
  )
);
